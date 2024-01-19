import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IBotContext } from "../context/context.interface";
import { IConfigService } from "../config/config.interface";

export class Photo extends Command {
  constructor(bot: Telegraf<IBotContext>, private readonly config: IConfigService) {
    super(bot);
  }
  handle (logger: any, database: any): void {
  }
}