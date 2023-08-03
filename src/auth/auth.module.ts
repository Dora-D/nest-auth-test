import { AuthController } from './auth.controller';
import { User } from '@app/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthService } from '@app/auth/auth.service';
import { AtStrategy } from '@app/auth/strategies/at.strategy';
import { RtStrategy } from '@app/auth/strategies/rt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}
