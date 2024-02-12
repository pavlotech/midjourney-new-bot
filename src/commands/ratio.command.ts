import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IBotContext } from "../context/context.interface";

export class Ratio extends Command {
  constructor (bot: Telegraf<IBotContext>) {
    super(bot);
  }
  handle (logger: any, database: any): void {
/*     const commands: string[] = [
      'ratio_1x1',
      'ratio_4x3',
      'ratio_16x9'
    ];
    commands.forEach(command => { this.bot.command(command, async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: ctx.from.id })
        if (!user || user.ban) return;

        const ratio = command.replace('ratio_', '').replace('x', ':');

        ctx.reply(`*Соотношение сторон изменено на ${ratio}*`, { parse_mode: 'Markdown' })
        await database.update('user', { userId: ctx.from.id }, { ratio: ratio })
      } catch (error) {
        logger.error(error);
      }
    })}); */
    this.bot.command('ratio', async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: ctx.from.id });
        if (!user || user.ban) return;
        let newRatio;
        let response;
        switch (user.ratio) {
          case '1:1':
            newRatio = '4:3';
            response = 'Разрешение изменено на 4:3';
            break;
          case '4:3':
            newRatio = '16:9';
            response = 'Разрешение изменено на 16:9';
            break;
          case '16:9':
            newRatio = '1:1';
            response = 'Разрешение изменено на 1:1';
            break;
          default:
            return;
        }
        await database.update('user', { userId: ctx.from.id }, { ratio: newRatio });

        ctx.reply(`*${response}*`, { parse_mode: "Markdown" });
      } catch (error) {
        logger.error(error);
      }
    });
  }
}