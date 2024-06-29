import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MenuEntity } from "./menu.entity";
import axios from "axios";

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
  ) {}

  private async fetchImageAsBase64(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    return buffer.toString("base64");
  }

  async fetchMenuFromSauna(): Promise<void> {
    const url = "https://www.restaurantsauna.cz/poledni-menu/obedova-nabidka";
    const imageBase64 = await this.fetchImageAsBase64(url);

    await this.menuRepository.clear(); // Clear old data

    const menu = new MenuEntity();
    menu.restaurant = "Sauna";
    menu.imageBase64 = imageBase64;

    await this.menuRepository.save(menu);
  }

  async fetchAllMenus(): Promise<void> {
    await this.fetchMenuFromSauna();
  }

  async getAllMenus(): Promise<MenuEntity[]> {
    return await this.menuRepository.find();
  }
}
