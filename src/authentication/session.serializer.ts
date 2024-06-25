// session.serializer.ts
import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    serializeUser(user: any, done: (err: Error, user: any) => void): void {
        done(null, user);
    }

    deserializeUser(payload: any, done: (err: Error, payload: string) => void): void {
        done(null, payload);
    }
}
