import { Controller, Get, UseGuards } from '@nestjs/common';
import { IUser } from '../types/IUser';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../decorator/customize';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: IUser) {
    const userData = await this.userService.findById(user.id);
    return {
      id: userData._id,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar,
      credits: userData.credits,
      role: userData.role,
    };
  }
}
