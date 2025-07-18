import {
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
export const MESSAGE_RESPONSE = 'response_message';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
export const ResponseMessage = (message: string) =>
  SetMetadata(MESSAGE_RESPONSE, message);
export const Roles = Reflector.createDecorator<string[]>();
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    // If data is provided, return specific field from user
    if (data) {
      return request.user?.[data];
    }

    return request.user;
  },
);
