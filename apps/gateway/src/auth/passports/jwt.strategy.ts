/* eslint-disable */

import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IUser } from "../../types/IUser";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req) => {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        return token;
      },
      // ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
      ignoreExpiration: false, 
    });
  }

  async validate(payload: IUser) {

    // const { id, username, email, role } = payload;
    // const userRole = role as unknown as {_id: string, name: string}
    // const temp = await this.rolesService.findOne(userRole._id);

    return {
     ...payload
    };
  }
}
