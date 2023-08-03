import { Controller, Post } from '@nestjs/common';
import { AuthService } from '@app/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/local/signup')
  signupLocal() {
    return this.authService.signupLocal();
  }

  @Post('/local/signin')
  signinLocal() {
    return this.authService.signinLocal();
  }

  @Post('/logout')
  logout() {
    return this.authService.logout();
  }

  @Post('/refresh')
  refresh() {
    return this.authService.refresh();
  }
}
