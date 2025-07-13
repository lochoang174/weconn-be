/* eslint-disable */

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',       // Trường email
      passwordField: 'password',   // Trường password
      passReqToCallback: true // Thêm dòng này

    });
  }


  async validate(req: any, email: string, password: string): Promise<any> {
    console.log(req.body)
    const name = req.body.name; // Lấy credential từ body của request
    const avatar = req.body.avatar
    const user = await this.authService.validate(email,name,avatar);
    if (!user) {
      throw new UnauthorizedException('Email, Password hoặc Credential không hợp lệ');
    }
    return user;
  }
}
