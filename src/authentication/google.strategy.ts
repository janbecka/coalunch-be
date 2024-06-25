// google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService, configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: `${configService.get<string>('BACKEND_URL')}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    /**
     * Converts an image URL to a base64-encoded string asynchronously.
     * @param {string} url - The URL of the image to be converted.
     * @returns {Promise<string>} A base64-encoded string of the image.
     * @throws {Error} If the conversion fails.
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
     * Validates google auth login
     * @param accessToken
     * @param refreshToken
     * @param profile
     * @returns
     */
    async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
        const { photos } = profile;

        if (photos && photos.length > 0) {
            const photoUrl = photos[0].value;
            if (!photoUrl.includes('googleusercontent.com')) {
                return this.authService.validateGoogleUser(profile);
            }
            const photoBase64 = await this.convertImageToBase64(photoUrl);
            profile.photos[0].value = `data:image/jpeg;base64,${photoBase64}`;
        }

        const user = await this.authService.validateGoogleUser(profile);
        return user;
    }
}
