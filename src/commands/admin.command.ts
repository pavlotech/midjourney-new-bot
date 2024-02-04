import { Telegraf } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { Command } from "./command.class";
import { admin, buttonArray, buttons } from "../../settings";

export class Admin extends Command {
  constructor (bot: Telegraf<IBotContext>) {
    super(bot);
  }
  handle (logger: any, database: any): void {
    this.bot.command('admin_panel', async (ctx) => {
      try {
        logger.info(`${ctx.from?.id} - https://t.me/${ctx.from?.username} use /admin_panel`)
        const user = await database.findUnique('user', { userId: String(ctx.from?.id) })
        if (!user || user.ban) return;
        if (!user.admin) return logger.warn(`${ctx.from?.id} - https://t.me/${ctx.from?.username} tried to log into the admin panel`)

        ctx.reply(`*Вы вошли в панель администратора*`, {
          reply_markup: {
            inline_keyboard: buttonArray
          },
          parse_mode: 'Markdown'
        })
      } catch (error) {
        logger.error(error);
      }
    })
    buttons.forEach(button => { this.bot.action(button, async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: String(ctx.from?.id) })
        if (!user.admin) return logger.warn(`${ctx.from?.id} - https://t.me/${ctx.from?.username} tried using the admin panel`)

        ctx.scene.enter(button);
      } catch (error) {
        logger.error(error)
      }
    })});
    this.bot.action('add_admin', async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: String(ctx.from?.id) })
        if (!user.admin) return logger.warn(`${ctx.from?.id} - https://t.me/${ctx.from?.username} tried using the admin panel`)

        const password = generatePassword(30)
        ctx.reply(admin.text, {
          reply_markup: {
            inline_keyboard: [
              [{ text: admin.button, url: `https://t.me/${ctx.botInfo.username}?start=${password}` }]
            ]
          },
          parse_mode: 'MarkdownV2'
        })
        await database.create('password', { password: password })        
      } catch (error) {
        logger.error(error)
      }
    })
    function generatePassword (length: number) {
      try {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password: string = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          password += charset[randomIndex];
        }
        return password;
      } catch (error) {
        logger.error(error)
      }
    }
  }
}