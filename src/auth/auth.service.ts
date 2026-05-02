import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, name: user.name, avatarUrl: user.avatarUrl };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    };
  }

  async register(data: any) {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await this.usersService.create({
      email: data.email,
      name: data.name,
      passwordHash: hashedPassword,
    });
    
    return this.login(newUser);
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new BadRequestException('No user from google');
    }

    let user = await this.usersService.findByEmail(req.user.email);
    if (!user) {
      // Create user
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await this.usersService.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`.trim(),
        passwordHash: hashedPassword,
        avatarUrl: req.user.picture,
      });
    } else if (user.avatarUrl !== req.user.picture) {
      user = await this.usersService.update(user.id, { avatarUrl: req.user.picture });
    }

    return this.login(user);
  }
}
