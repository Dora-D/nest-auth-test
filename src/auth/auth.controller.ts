import { AuthDto } from '@app/auth/dto/auth.dto';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '@app/auth/auth.service';
import { Tokens } from '@app/auth/types/tokens.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(HttpStatus.CREATED)
  @Post('local/signup')
  signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('local/signin')
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  // @HttpCode(HttpStatus.OK)
  // @Post('logout')
  // logout(userId: number): Promise<boolean> {
  //   return this.authService.logout(userId);
  // }

  // @HttpCode(HttpStatus.OK)
  // @Post('refresh')
  // refreshTokens(): Promise<Tokens> {
  //   return this.authService.refreshTokens();
  // }
}
