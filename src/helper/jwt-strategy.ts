import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type PayLoad = {
  id: number;
  email: string;
  role: string;
};

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      ignoreExpiration: false, // toker punya masa expired nya
      secretOrKey: config.get<string>('secret_key') || 'secret_key', // mendefinisikan secret key dari env
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // mengambil token dari header
    });
  }
  async validate(payload: any) {
    return {
      id: payload.sub ?? payload.id,
      role: payload.role,
      email: payload.email,
    };
  }
}
