import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SigneedCookie = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return key && key in request.signedCookies
      ? request.signedCookies[key]
      : key
      ? null
      : request.signedCookies;
  },
);
