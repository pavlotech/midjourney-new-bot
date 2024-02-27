import { Telegraf } from "telegraf";
import { Event } from "../events/event.class";
import { IBotContext } from "../context/context.interface";
import { IConfigService } from "../config/config.interface";
import { translate } from 'bing-translate-api';
import { buttons, generationButtons, noRequest, waitRequest } from "../../settings";
import { Generation } from "../types/generation.class";
import { generationParams } from "../functions/params.function";
import { checkAndCorrectHyphen, checkList } from "../functions/check.function";

export class Photo extends Event {
  constructor(bot: Telegraf<IBotContext>, private readonly config: IConfigService) {
    super(bot);
  }
  handle (logger: any, database: any): void {
    this.bot.on('text', async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: ctx.from.id })
        if (!user || user.ban) return;
        if (user.subscribe <= 0) return ctx.reply(noRequest, { parse_mode: 'Markdown' })
        if (user.treatment) return ctx.reply(waitRequest, { parse_mode: 'Markdown' })
    
        let prompt = '';
        let links = '';

        const linkRegex = /(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*/gi;
        const matches = ctx.message.text.matchAll(linkRegex);
    
        for (const match of matches) {
          links += match[0].trim() + ' ';
          ctx.message.text = ctx.message.text.replace(match[0], '').trim();
        }

        prompt = ctx.message.text.trim();
        const processedPrompt = (await translate(checkAndCorrectHyphen(prompt), null, "en")).translation;
        if (checkList(processedPrompt)) return ctx.reply(`*Запрос "${prompt}" не прошел модерацию*`, { parse_mode: 'Markdown' })
    
        await database.update('user', { userId: ctx.from.id }, {
          prompt: processedPrompt,
          treatment: true
        })
        const fullPrompt = `${links + (links ? '\n' : '')} ${processedPrompt}`;
        //logger.log(fullPrompt)

        new Generation(database, logger, this.config).generation(ctx, user, 'imagine', {
          prompt: fullPrompt,
          aspect_ratio: user.ratio,
          process_mode: "fast"
        }, generationButtons);
      } catch (error) {
        logger.error(error)
      }
    })
    buttons.forEach(button => { 
      this.bot.action(button, async (ctx) => {
        try {
          const user = await database.findUnique('user', { userId: ctx.from?.id })
          if (!user || user.ban) return;
          if (user.subscribe <= 0) return ctx.reply(noRequest, { parse_mode: 'Markdown' })
          if (user.treatment) return ctx.reply(waitRequest, { parse_mode: 'Markdown' })
    
          const tasks = await database.findMany('task', { userId: ctx.from?.id })
          const task = tasks[tasks.length - 1]
          const params = generationParams(task.task_id, button, user)

          await database.update('user', { userId: ctx.from?.id }, { treatment: true })

          new Generation(database, logger, this.config).generation(ctx, user, params.name || '', params.params, params.generationType);
        } catch (error) {
          logger.error(error)
        }
      });
    });
  }
}