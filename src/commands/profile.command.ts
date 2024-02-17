import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IBotContext } from "../context/context.interface";

export class Profile extends Command {
  constructor (bot: Telegraf<IBotContext>) {
    super(bot);
  }
  handle (logger: any, database: any): void {
    this.bot.command('my_profile', async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: ctx.from.id })
        if (!user) return;
        if (user.ban) return;
        ctx.reply(`
*ID:* \`${ctx.from.id}\`
Остаток запросов: ${user.subscribe}

Пополнить баланс - /vip`, { parse_mode: 'Markdown' }
        )
        logger.info(`${ctx.from.id} - https://t.me/${ctx.from.username} use /my_profile`)
      } catch (error) {
        logger.error(error)
      }
    })
  }
}