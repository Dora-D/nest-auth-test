import { AuthDto } from '@app/auth/dto/auth.dto';
import { User } from '@app/user/entities/user.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '@app/auth/types/jwtPayload.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from '@app/auth/types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hash = await this.hashData(rt);
    await this.userRepo.update({ id: userId }, { hashedRt: hash });
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async signupLocal(dto: AuthDto) {
    const hash = await this.hashData(dto.password);
    const user = await this.userRepo.save({
      email: dto.email,
      hash,
    });
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async signinLocal(dto: AuthDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number): Promise<boolean> {
    await this.userRepo.update({ id: userId }, { hashedRt: null });
    return true;
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }
}
