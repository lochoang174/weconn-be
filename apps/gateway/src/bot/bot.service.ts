import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateBotDto } from './dto/create-bot.dto';
import {
  BOT_CRUD_SERVICE_NAME,
  BotCrudServiceClient,
  BotResponse,
  CreateBotRequest,
  UpdateBotRequest,
  DeleteBotRequest,
  DeleteBotResponse,
  GetAllBotsRequest,
  GetAllBotsResponse,
  UpdateAllBotCookieUrlRequest,
  UpdateAllBotCookieUrlResponse,
} from 'proto/bot-crud';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BotService implements OnModuleInit {
  private botCrudService: BotCrudServiceClient;

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @Inject(BOT_CRUD_SERVICE_NAME) private clientGrpc: ClientGrpc,
  ) {}

  onModuleInit() {
    this.botCrudService = this.clientGrpc.getService<BotCrudServiceClient>('BotCrudService');
  }

  async createBot(createBotDto: CreateBotDto): Promise<BotResponse> {
    const request: CreateBotRequest = {
      botId: createBotDto.bot_id,
      cookieUrl: createBotDto.cookie_url,
    };

    try {
      console.log(request);
      const response = await firstValueFrom(this.botCrudService.createBot(request));
      return {...response};
    } catch (error) {
      console.error('❌ gRPC CreateBot error:', error);
      if (error?.details?.includes('already exists')) {
        throw new ConflictException('Bot ID already exists');
      }
      throw new InternalServerErrorException('Failed to create bot');
    }
  }

  async updateBot(updateBotDto: CreateBotDto): Promise<BotResponse> {
    const request: UpdateBotRequest = {
      botId: updateBotDto.bot_id,
      cookieUrl: updateBotDto.cookie_url,
    };

    try {
      return await firstValueFrom(this.botCrudService.updateBot(request));
    } catch (error) {
      console.error('❌ gRPC UpdateBot error:', error);
      throw new InternalServerErrorException('Failed to update bot');
    }
  }

  async deleteBot(id: string): Promise<DeleteBotResponse> {
    const request: DeleteBotRequest = { id };

    try {
      return await firstValueFrom(this.botCrudService.deleteBot(request));
    } catch (error) {
      console.error('❌ gRPC DeleteBot error:', error);
      if (error?.code === 5 || error?.details?.includes('not found')) {
        throw new NotFoundException('Bot not found');
      }
      throw new InternalServerErrorException('Failed to delete bot');
    }
  }

  async getAllBots(): Promise<GetAllBotsResponse> {
    const request: GetAllBotsRequest = {};

    try {
      return await firstValueFrom(this.botCrudService.getAllBots(request));
    } catch (error) {
      console.error('❌ gRPC GetAllBots error:', error);
      throw new InternalServerErrorException('Failed to fetch bots');
    }
  }

  async updateAllBotCookieUrl(cookieUrl: string): Promise<UpdateAllBotCookieUrlResponse> {
    const request: UpdateAllBotCookieUrlRequest = {cookieUrl };

    try {
      return await firstValueFrom(this.botCrudService.updateAllBotCredentials(request));
    } catch (error) {
      console.error('❌ gRPC UpdateAllBotCookieUrl error:', error);
      throw new InternalServerErrorException('Failed to update all bot cookie URLs');
    }
  }
}
