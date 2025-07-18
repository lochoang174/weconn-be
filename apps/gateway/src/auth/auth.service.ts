import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IUser } from '../types/IUser';

@Injectable()
export class AuthService {
  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });

    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.login(user as IUser);
  }
  constructor(
    private readonly usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async validate(
    emailValidate: string,
    name: string,
    avatarPayload: string,
  ): Promise<any> {
    let user = await this.usersService.validate(
      emailValidate,
      name,
      avatarPayload,
    );

    console.log('user', user);

    const { role, _id, username, email, avatar, credits } = user;
    return {
      role,
      id: _id,
      username,
      email,
      avatar: avatar,
      credits: credits || 0, // Ensure credits is always defined
    };
  }

  async login(user: IUser) {
    const latestUser = await this.usersService.findById(user.id); // <-- Fetch fresh user
    if (!latestUser) throw new Error('User not found');

    const access_token = this.jwtService.sign(
      {
        id: latestUser._id,
        role: latestUser.role,
        username: latestUser.username,
        email: latestUser.email,
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        id: latestUser._id,
        role: latestUser.role,
        username: latestUser.username,
        email: latestUser.email,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED'),
      },
    );

    await this.usersService.updateToken(
      refresh_token,
      latestUser._id.toString(),
    );

    return {
      user: {
        id: latestUser._id,
        username: latestUser.username,
        email: latestUser.email,
        avatar: latestUser.avatar,
        credits: latestUser.credits,
        role: latestUser.role,
      },
      refresh_token,
      access_token,
    };
  }

  async logout() {
    // return this.usersService.remove(signupDto);
  }
}
