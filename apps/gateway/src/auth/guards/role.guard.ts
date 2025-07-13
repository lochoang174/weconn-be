import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "../../decorator/customize";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }

    // Kiểm tra xem context là HTTP hay GraphQL
    // const contextType = context.getType();
    let user = context.switchToHttp().getRequest().user;
    

    if (!user) {
      throw new ForbiddenException("User not found in request");
    }

    if (roles.includes(user.role)) return true;
    throw new ForbiddenException(
      "You are not authorized to access this resource",
    );
  }
}
