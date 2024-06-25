import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { SESSION_EXPIRATION } from './config/constants';
import { json } from 'express';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.use(
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: { httpOnly: true, maxAge: SESSION_EXPIRATION }, // 1 hour for example
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(json({ limit: '5MB' }));

    app.useGlobalPipes(new ValidationPipe());
    const config = new DocumentBuilder()
        .setTitle('CoalShift API')
        .setDescription('The API for the CoalShift application')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT || 3000);
}
bootstrap();
