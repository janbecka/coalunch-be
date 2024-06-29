import { Controller, Get } from "@nestjs/common";
import { MenuService } from "./menu.service";

@Controller("menu")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get("fetch")
  async fetchMenus() {
    await this.menuService.fetchAllMenus();
    return { message: "Menus fetched and saved successfully" };
  }

  @Get()
  async getAllMenus(): Promise<
    { id: number; restaurant: string; imageBase64: string }[]
  > {
    const menus = await this.menuService.getAllMenus();
    return menus.map((menu) => ({
      id: menu.id,
      restaurant: menu.restaurant,
      imageBase64: menu.imageBase64,
    }));
  }
}
