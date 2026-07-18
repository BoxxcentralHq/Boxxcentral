import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../auth-cookies';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/** Primary source: the httpOnly access-token cookie set at login. */
const cookieExtractor = (req: Request): string | null => {
  const cookies = req?.cookies as Record<string, string | undefined>;
  return cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        // Bearer fallback keeps Postman/API testing convenient
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      // getOrThrow: refuse to boot with a missing secret rather than
      // silently signing tokens with a guessable fallback
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
