import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskService } from "../task/task.service";
import { MenuModule } from "../menu/menu.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "src/config/envs/.env",
    }),
    TypeOrmModule.forFeature([]),
    MenuModule,
  ],
  controllers: [],

  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
