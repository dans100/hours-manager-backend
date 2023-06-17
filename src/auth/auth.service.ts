import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './strategies/jwt.strategy';
import { sign } from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';
import { v4 as uuid } from 'uuid';
import { AuthLoginDto } from './dto/auth-login.dto';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { cookieConfig } from '../config/cookie.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
  ) {}

  private createTokens({ currentAccessToken, currentRefreshToken }): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessTokenPayload: JwtPayload = { id: currentAccessToken };
    const refreshTokenPayload: JwtPayload = { id: currentRefreshToken };

    const accessToken = sign(
      accessTokenPayload,
      this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      {
        expiresIn: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    );

    const refreshToken = sign(
      refreshTokenPayload,
      this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      {
        expiresIn: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateTokens(
    user: User,
  ): Promise<{ currentAccessToken: string; currentRefreshToken: string }> {
    let currentAccessToken;
    let currentRefreshToken;
    let userWithThisToken = null;

    do {
      currentAccessToken = uuid();
      userWithThisToken = await User.findOneBy({
        currentAccessToken,
      });
    } while (!!userWithThisToken);
    user.currentAccessToken = currentAccessToken;

    do {
      currentRefreshToken = uuid();
      userWithThisToken = await User.findOneBy({
        currentRefreshToken,
      });
    } while (!!userWithThisToken);
    user.currentRefreshToken = currentRefreshToken;

    await user.save();

    return {
      currentAccessToken,
      currentRefreshToken,
    };
  }

  async login(req: AuthLoginDto, res: Response): Promise<any> {
    try {
      const user = await User.findOneBy({
        username: req.username,
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const pwdIsValid = await bcrypt.compare(
        req.password,
        user.hashedPassword,
      );

      if (!pwdIsValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const { accessToken, refreshToken } = this.createTokens(
        await this.generateTokens(user),
      );

      return res
        .cookie('accessToken', accessToken, {
          ...cookieConfig,
          maxAge: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        })
        .cookie('refreshToken', refreshToken, {
          ...cookieConfig,
          maxAge: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        })
        .json({ ok: true });
    } catch (e) {
      return res.json({ error: e.message });
    }
  }

  async logout(user: User, res: Response) {
    try {
      user.currentAccessToken = null;
      user.currentRefreshToken = null;
      await user.save();
      res
        .clearCookie('accessToken', {
          ...cookieConfig,
          maxAge: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        })
        .clearCookie('refreshToken', {
          ...cookieConfig,
          maxAge: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        });
      return res.json({ ok: true });
    } catch (e) {
      return res.json({ error: e.message });
    }
  }

  async refreshToken(user: User, res: Response): Promise<any> {
    try {
      const { accessToken, refreshToken } = this.createTokens(
        await this.generateTokens(user),
      );

      return res
        .cookie('accessToken', accessToken, {
          ...cookieConfig,
          maxAge: +this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        })
        .cookie('refreshToken', refreshToken, {
          ...cookieConfig,
          maxAge: +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        })
        .json({ ok: true });
    } catch (e) {
      return res.json({ error: e.message });
    }
  }
}
