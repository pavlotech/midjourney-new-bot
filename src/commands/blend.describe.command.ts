import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IBotContext } from "../context/context.interface";
import { noRequest, waitRequest } from "../../settings";

export class BlendDescribe extends Command {
  constructor (bot: Telegraf<IBotContext>) {
    super(bot);
  }
  handle (logger: any, database: any): void {
    this.bot.command('blend', async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: ctx.from.id })
        if (!user || user.ban) return;
        if (user.subscribe <= 0) return ctx.reply(noRequest, { parse_mode: 'Markdown' })
        if (user.treatment) return ctx.reply(waitRequest, { parse_mode: 'Markdown' })

        ctx.scene.enter('blend_first_photo')
      } catch (error) {
        logger.error(error);
      }
    })
    this.bot.command('describe', async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: ctx.from.id })
        if (!user || user.ban) return;
        if (user.subscribe <= 0) return ctx.reply(noRequest, { parse_mode: 'Markdown' })
        if (user.treatment) return ctx.reply(waitRequest, { parse_mode: 'Markdown' })

        ctx.scene.enter('describe_get_photo')
      } catch (error) {
        logger.error(error);
      } 
    })
  }
}