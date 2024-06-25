// local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    /**
     * Validates local auth login
     * @param email
     * @param password
     * @returns
     */
    async validate(email: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(email, password);
        return user;
    }
}
