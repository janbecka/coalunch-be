// facebook.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Profile, Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(private authService: AuthService, configService: ConfigService) {
        super({
            clientID: configService.get<string>('FACEBOOK_CLIENT_ID'),
            clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET'),
            callbackURL: `${configService.get<string>('BACKEND_URL')}/auth/facebook/callback`,
            scope: ['email'],
            profileFields: ['id', 'emails', 'name', 'photos'],
            enableProof: true,
        });
    }

    /**
     * Converts an image URL to a base64-encoded string asynchronously.
     * @param {string} url - The URL of the image to be converted to base64.
     * @returns {Promise<string>} A promise that resolves with a base64-encoded string representation of the image.
     * @throws {Error} Throws an error if the image cannot be fetched or encoded.
     */
    private async convertImageToBase64(url: string): Promise<string> {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
            });
            return Buffer.from(response.data, 'binary').toString('base64');
        } catch (error) {
            throw new Error(`Failed to convert image to base64: ${error.message}`);
        }
    }

    /**
     * Validates facebook auth login
     * @param accessToken
     * @param refreshTokens
     * @param profile
     * @returns
     */
    async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
        if (profile.photos && profile.photos.length > 0) {
            const photoUrl = profile.photos[0].value;
            const photoBase64 = await this.convertImageToBase64(photoUrl);
            profile.photos[0].value = `data:image/jpeg;base64,${photoBase64}`;
        }

        return this.authService.validateFacebookUser(profile);
    }
}
