import { Telegraf, TelegramError } from "telegraf";
import { Event } from "../events/event.class";
import { IBotContext } from "../context/context.interface";
import { IConfigService } from "../config/config.interface";
import { translate } from 'bing-translate-api';
import axios from "axios";
import * as fs from 'fs';
import { buttons, generationButtons, noRequest, waitRequest } from "../../settings";
import { Generation } from "../types/generation.class";
import { generationParams } from "../functions/params.function";

export class Photo extends Event {
  constructor(bot: Telegraf<IBotContext>, private readonly config: IConfigService) {
    super(bot);
  }
  handle (logger: any, database: any): void {
    const checkList = (word: string) => {
      const bannedWords = fs.readFileSync('banList.txt', 'utf-8').split('\r\n');
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      for (const bannedWord of bannedWords) {
        if (regex.test(bannedWord)) return true
      }
      return false;
    }
    const checkAndCorrectHyphen = (text: string) => {
      if (text.includes('-') && !text.includes('--')) {
        text = text.replace('-', '--');
      }
      return text;
    }
    this.bot.on('text', async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: ctx.from.id })
        if (!user || user.ban) return;
        if (user.subscribe <= 0) return ctx.reply(noRequest, { parse_mode: 'Markdown' })
        if (user.treatment) return ctx.reply(waitRequest, { parse_mode: 'Markdown' })

        const prompt = (await translate(checkAndCorrectHyphen(ctx.message.text), null, "en")).translation.toLowerCase();
        if (checkList(prompt)) return ctx.reply(`*Запрос "${ctx.message.text}" не прошел модерацию*`, { parse_mode: 'Markdown' })

        await database.update('user', { userId: ctx.from.id }, {
          prompt: prompt,
          treatment: true
        })
        new Generation(database, logger, this.config).generation(ctx, user, 'imagine', {
          prompt: prompt,
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