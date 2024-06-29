import { Module } from "@nestjs/common";
import { MenuController } from "./menu.controller";
import { MenuEntity } from "./menu.entity";
import { MenuService } from "./menu.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "src/config/envs/.env",
    }),
    TypeOrmModule.forFeature([MenuEntity]),
    HttpModule,
  ],
  controllers: [MenuController],

  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
