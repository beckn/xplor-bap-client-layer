// src/common/decorators/extract-token.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExtractToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const token = request.headers.authorization;
  return token;
});
