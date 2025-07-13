import {

  Injectable,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { IUser } from "../types/IUser";


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }
  async validate(
    emailValidate: string,
    name:string,
    avatarPayload:string
  ): Promise<any> {
    let user = await this.usersService.validate(emailValidate,name,avatarPayload);
   


    const { role, _id, username, email, avatar } =user;
    return {
      role,
      id: _id,
      username,
      email,
      avatar: avatar,
    };
  }

  async login(user: IUser) {
    console.log(user);
    const access_token = this.jwtService.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
      },
      {
        secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),

        expiresIn: this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRED"), // Cập nhật thời gian hết hạn theo yêu cầu
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        id: user.id,
        role: user.role,
        uesrname: user.username,
        email: user.email,
      },
      {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),

        expiresIn: this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRED"), // Cập nhật thời gian hết hạn theo yêu cầu
      },
    );
    await this.usersService.updateToken(refresh_token, user.id);
    return {
      user,
      refresh_token,
      access_token,
    };
  }


  async logout() {
    // return this.usersService.remove(signupDto);
  }

}
