import { Telegraf } from "telegraf";
import { Event } from "../events/event.class";
import { IBotContext } from "../context/context.interface";
import { IConfigService } from "../config/config.interface";
import { translate } from 'bing-translate-api';
import { Midjourney } from 'midjourney'
import { buttonsGenerate, labels, moderation, noRequest } from "../../settings";
import finalyMessage from "../functions/finalyMessage";
import findCustomByLabel from "../functions/findCustomByLabel";
import loadingMessage from "../functions/loadingMessage";
import * as fs from 'fs';

export class Photo extends Event {
  constructor(bot: Telegraf<IBotContext>, private readonly config: IConfigService) {
    super(bot);
  }
  handle (logger: any, database: any): void {
    const client = new Midjourney({
      ServerId: this.config.get('MIDJOURNEY_SERVERID'),
      ChannelId: this.config.get('MIDJOURNEY_CHANNELID'),
      SalaiToken: this.config.get('MIDJOURNEY_SALAITOKEN'),
      //Debug: true,
      Ws: true,
    });
    client.init();
    
    async function MidjourneyGenerate (ctx: IBotContext, prompt: string, userId: number) {
      try {
        const initialMessage = await ctx.replyWithPhoto(
          { source: 'background.png' },
          { caption: '*Пожалуйста подождите*', parse_mode: 'Markdown' }
        )
        ctx.sendChatAction('typing')
        const result = await client.Imagine(prompt,
          async (uri, progress) => {
            ctx.sendChatAction('typing')
            await ctx.telegram.editMessageMedia(userId, initialMessage.message_id, '',
              {
                type: 'photo',
                media: { url: uri },
                caption: `*Прогресс: ${progress}*`,
                parse_mode: 'Markdown'
              }
            );
          }
        );
        ctx.session.data = result
        await ctx.telegram.editMessageMedia(userId, initialMessage.message_id, '',
          {
            type: 'photo',
            media: { url: String(result?.proxy_url) },
            caption: `[Ссылка на изображение](${result?.proxy_url})`,
            parse_mode: 'Markdown'
          },
          {
            reply_markup: {
              inline_keyboard: buttonsGenerate
            }
          }
        );  
      } catch (error) {
        logger.error(error);
      }
    }
    async function MidjourneyCustom (ctx: IBotContext, userId: number, label: string, prompt: string) {
      try {
        const customId = findCustomByLabel(ctx.session.data.options, label)
        let modifiedPrompt = ['Custom Zoom', 'Vary (Strong)'].includes(label)
        ? `${prompt} --zoom 2` : prompt;

        const initialMessage = await ctx.replyWithPhoto(
          { source: 'background.png' },
          { caption: '*Пожалуйста подождите*', parse_mode: 'Markdown' }
        )
        if (/Zoom Out/.test(label)) {
          const match = label.match(/(\d+(\.\d+)?)x$/);
          if (match) {
            const result = await client.ZoomOut({
              level: match[1],
              msgId: <string>ctx.session.data.id,
              hash: <string>ctx.session.data.hash,
              flags: ctx.session.data.flags,
              loading: async (uri: string, progress: string) => {
                await loadingMessage(ctx, uri, userId, initialMessage.message_id, progress, logger);
              },
            });
            ctx.session.data = result;
            await finalyMessage(ctx, String(result?.proxy_url), userId, initialMessage.message_id, label, logger);
          }
        } else {
          const result = await client.Custom({
            msgId: <string>ctx.session.data.id,
            flags: ctx.session.data.flags,
            content: modifiedPrompt,
            customId: customId,
            loading: async (uri: string, progress: string) => {
              await loadingMessage(ctx, uri, userId, initialMessage.message_id, progress, logger)
            },
          });
          ctx.session.data = result
          await finalyMessage(ctx, String(result?.proxy_url), userId, initialMessage.message_id, label, logger)
        }
      } catch (error) {
        logger.error(error)
      }
    }
    async function сheckBanList (word: string) {
      const bannedWords = fs.readFileSync('banList.txt', 'utf-8').split('\r\n');
      logger.log(bannedWords)
      return bannedWords.includes(`${word.toLowerCase()}`);
    }
    this.bot.on('text', async (ctx) => {
      try {
        const userId = ctx.from.id
        const user = await database.findUnique('user', { userId: String(userId) })
        if (!user || user.ban) return;
        if (user.subscribe <= 0) {
          return ctx.reply(noRequest, { parse_mode: 'Markdown' })
        }
        let prompt = (await translate(ctx.message.text, null, "en")).translation
        logger.log(await сheckBanList(prompt))
/*         if (await сheckBanList(prompt)) {
          await MidjourneyGenerate(ctx, String(prompt), userId);
          await database.update('user', { userId: String(userId) }, {
            prompt: prompt,
            subscribe: user.subscribe - 1
          })
        } else {
          ctx.reply(`*${moderation(prompt)}*`, { parse_mode: 'Markdown' })
        } */
      } catch (error) {
        logger.error(error)
      }
    })
    labels.forEach(label => { this.bot.action(label, async (ctx) => {
      try {
        const userId = ctx.from?.id || 0
        const user = await database.findUnique('user', { userId: String(userId) })
        const prompt = user.prompt

        if (label == '🔄') {
          await MidjourneyGenerate(ctx, prompt, userId);
          await database.update('user', { userId: String(userId) }, {
            subscribe: user.subscribe - 1
          })
        }
        await MidjourneyCustom(ctx, userId, label, prompt)
      } catch (error) {
        logger.error(error)
      }
    })});

/*     this.bot.on('photo', async (ctx) => {
      try {
        const photo = ctx.message?.photo;
        const fileId = photo[photo.length - 1].file_id;
        const fileUrl = (await ctx.telegram.getFileLink(fileId)).href;

        const Imagine = await client.Imagine(
          `https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Felis_silvestris_silvestris.jpg/275px-Felis_silvestris_silvestris.jpg dog`,
          (uri: string, progress: string) => {
            logger.log(`loading, ${uri}, progress, ${progress}`);
          }
        );
        logger.log(Imagine);
      } catch (error) {
        logger.error(error)
      }
    }); */
  }
}
