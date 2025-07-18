import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { LocalAuthGuard } from './guards/local-auth.guard';

import { refreshDto } from './dto/refresh.dto';
import { CurrentUser, Public, ResponseMessage } from '../decorator/customize';
import { IUser } from '../types/IUser';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard) // Sửa Local thành LocalAuthGuard
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successfully!')
  async login(@CurrentUser() user: IUser) {
    const res = this.authService.login(user);
    return res;
  }

  @Post('logout')
  async logout() {
    return this.authService.logout();
  }
  @Public()
  @Post('refresh')
  async refresh(@Body() payload: refreshDto) {
    return this.authService.refreshToken(payload.refreshToken);
  }
}
