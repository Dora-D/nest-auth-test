import { ConfigService } from '@nestjs/config';
import { AuthDto } from '@app/auth/dto/auth.dto';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@app/auth/auth.service';
import { Tokens } from '@app/auth/types/tokens.type';
import { GetCurrentUserId } from '@app/common/decorators/get-current-user-id.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { Response } from 'express';
import { SigneedCookie } from '@app/common/decorators/cookies.decorator';
import { JwtService } from '@nestjs/jwt';

const REFRESH_TOKEN = 'refreshtoken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('local/signup')
  async signupLocal(@Body() dto: AuthDto, @Res() res: Response) {
    const tokens = await this.authService.signupLocal(dto);
    this.setRefreshTokenToCookies(tokens, res);
  }

  @Public()
  @Post('local/signin')
  async signinLocal(@Body() dto: AuthDto, @Res() res: Response) {
    const tokens = await this.authService.signinLocal(dto);
    this.setRefreshTokenToCookies(tokens, res);
  }

  @Post('logout')
  async logout(@GetCurrentUserId() userId: number, @Res() res: Response) {
    await this.authService.logout(userId);
    res.cookie(REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: true,
      expires: new Date(),
    });
    res.sendStatus(HttpStatus.OK);
  }

  // @Public()
  // @UseGuards(RtGuard)
  @Post('refresh')
  async refreshTokens(
    @GetCurrentUserId() userId: number,
    @SigneedCookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setRefreshTokenToCookies(tokens, res);
  }

  private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    // const refreshTokenData = this.jwtService.decode(tokens.refresh_token);

    res.cookie(REFRESH_TOKEN, tokens.refresh_token, {
      httpOnly: true,
      signed: true,
      // expires: new Date(refreshTokenData['exp']),
      secure:
        this.configService.get('NODE_ENV', 'development') === 'production',
    });

    res.status(HttpStatus.CREATED).json({ accessToken: tokens.access_token });
  }
}
