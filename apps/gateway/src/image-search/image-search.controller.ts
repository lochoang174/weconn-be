import { Body, Controller, Headers, Post, Req, Res } from '@nestjs/common';
import { ImageSearchService } from './image-search.service';
import { CurrentUser, Public, Roles } from '../decorator/customize';
import { IUser } from '../types/IUser';
import { RoleEnum } from '../user/schema/user.schema';

@Controller('image-search')
export class ImageSearchController {
  constructor(private readonly imageSearchService: ImageSearchService) {}

  @Post('/public')
  @Public()
  async publicHandleSearch(
    @Body() data: any,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') forwardedFor: string,
    @Headers('x-real-ip') realIp: string,
    @Req() req: any,
  ) {
    const ip = realIp || forwardedFor || req.connection.remoteAddress || req.ip;
    const result = await this.imageSearchService.handleSearchGuest(
      data.url,
      userAgent,
      ip,
    );

    return result;
  }
  @Post('/private')
  @Roles([RoleEnum.CLIENT])
  async privateHandleSearch(@Body() data: any, @CurrentUser() user: IUser) {
    return await this.imageSearchService.handleSearchPrivate(data.url, user);
  }
}
