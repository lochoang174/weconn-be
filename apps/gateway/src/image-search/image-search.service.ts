import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  BOT_CRUD_SERVICE_NAME,
  BotCrudServiceClient,
  GetDetailHistoryRequest,
  GetHistoryRequest,
  SearchFacePrivateRequest,
  SearchFaceRequest,
} from 'proto/bot-crud';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';
import { IUser } from '../types/IUser';
import { GuestRepository } from '../guest/guest.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export interface SearchResult {
  guestId?: string;
  credits?: number;
  results?: any;
}

@Injectable()
export class ImageSearchService {
  private readonly logger = new Logger(ImageSearchService.name);
  private botCrudService: BotCrudServiceClient;

  constructor(
    @Inject(BOT_CRUD_SERVICE_NAME) private readonly clientGrpc: ClientGrpc,
    private readonly userService: UserService,
    private readonly guestRepository: GuestRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  onModuleInit() {
    this.botCrudService =
      this.clientGrpc.getService<BotCrudServiceClient>('BotCrudService');
  }

  async handleSearch(url: string, isPrivate: boolean, historyDetailId: string) {
    try {
      let request: SearchFacePrivateRequest | SearchFaceRequest = null;
      let response;

      if (isPrivate) {
        request = {
          historyDetailId: historyDetailId,
          url,
        };
        console.log(request);
        response = await firstValueFrom(
          this.botCrudService.searchFacePrivate(request),
        );
      } else {
        request = { url };
        response = await firstValueFrom(
          this.botCrudService.searchFacePublic(request),
        );
      }

      this.logger.debug('Search completed successfully', response);
      return response;
    } catch (error) {
      this.logger.error('Search operation failed', {
        error: error.message,
        url,
        stack: error.stack,
      });
      throw new InternalServerErrorException('Search service unavailable');
    }
  }

  /**
   * Handle search for authenticated users
   */
  async handleSearchPrivate(url: string, user: IUser, historyDetailId: string) {
    const userData = await this.validateUserCredits(user.id);

    try {
      const result = await this.handleSearch(url, true, historyDetailId);
      if (result.isExist) {
        return {
          credits: userData.credits,
          ...result,
        };
      }
      const updatedUser = await this.userService.updateCredits(user.id, -1);

      this.logger.log('Private search completed', { userId: user.id, url });
      return {
        credits: updatedUser.credits,
        ...result,
      };
    } catch (error) {
      this.logger.error('Private search failed', {
        error: error.message,
        userId: user.id,
        url,
      });

      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new BadRequestException('Cannot search image');
    }
  }

  /**
   * Handle search for guest users
   */
  async handleSearchGuest(
    url: string,
    userAgent: string,
    ip: string,
  ): Promise<SearchResult> {
    try {
      const guest = await this.findOrCreateGuest(userAgent, ip);
      this.validateGuestCredits(guest);

      const result = await this.handleSearch(url, false, '');
      const updatedGuest = await this.guestRepository.updateCredits(
        guest.guestId,
        -1,
      );

      this.logger.log('Guest search completed', {
        guestId: guest.guestId,
        url,
      });

      return {
        guestId: guest.guestId,
        credits: updatedGuest.credits,
        ...result,
      };
    } catch (error) {
      this.handleGuestSearchError(error, { url, userAgent, ip });
    }
  }

  private async validateUserCredits(userId: string) {
    const userData = await this.userService.findById(userId);

    if (userData.credits === 0) {
      throw new BadRequestException('User has no credits');
    }

    return userData;
  }

  private async findOrCreateGuest(userAgent: string, ip: string) {
    const existingGuest = await this.guestRepository.checkGuestId(
      userAgent,
      ip,
    );

    if (existingGuest) {
      return existingGuest;
    }

    return await this.guestRepository.createGuest(userAgent, ip);
  }

  private validateGuestCredits(guest: any) {
    if (guest.credits === 0) {
      throw new BadRequestException('User has no credits');
    }
  }

  private handleGuestSearchError(
    error: any,
    context: { url: string; userAgent: string; ip: string },
  ): never {
    if (error instanceof BadRequestException) {
      throw error;
    }

    this.logger.error('Guest search operation failed', {
      error: error.message,
      stack: error.stack,
      context,
    });

    throw new BadRequestException('Cannot search image for guest');
  }
  async getHistory(userId: string) {
    let request: GetHistoryRequest = {
      userId: userId,
    };

    const response = await firstValueFrom(
      this.botCrudService.getHistory(request),
    );
    return response;
  }
  async getHistoryDetail(historyId: string) {
    let request: GetDetailHistoryRequest = {
      historyId: historyId,
    };
    const response = await firstValueFrom(
      this.botCrudService.getDetailHistory(request),
    );

    // Process each result to get cropped face URLs
    const processedResults = [];
    for (const result of response.results) {
      if (result.faces) {
        // Get cropped face URLs for this result
        const croppedFaceUrls = this.cloudinaryService.getCroppedFaceUrls(
          response.url,
          [result.faces],
        );

        // Map to simplified structure with only historyDetailId, url, history_detail_id, and results
        if (croppedFaceUrls.length > 0) {
          const processedResult = {
            historyDetailId: result.historyDetailId,
            url: croppedFaceUrls[0].url,
            history_detail_id:
              croppedFaceUrls[0].history_detail_id ||
              result.faces.historyDetailId,
            results: result.results,
          };

          processedResults.push(processedResult);
        }
      }
    }

    return {
      results: processedResults,
    };
  }
}
