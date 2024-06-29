import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MenuService } from "../menu/menu.service";

@Injectable()
export class TaskService {
  constructor(private readonly menuService: MenuService) {}

  // Fetch menu from Sauna every day at 6 AM
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleDailySaunaMenuFetch() {
    await this.menuService.fetchMenuFromSauna();
    console.log("Fetched menu from Sauna");
  }

  // // Fetch menu from Skipi every Monday at 6 AM
  // @Cron(CronExpression.EVERY_DAY_AT_6AM)
  // async handleWeeklySkipiMenuFetch() {
  //   await this.menuService.fetchMenuFromSkipi();
  //   console.log("Fetched menu from Skipi");
  // }
}
