import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IBotContext } from "../context/context.interface";
import { IConfigService } from "../config/config.interface";
import { translate } from 'bing-translate-api';
import { Midjourney } from 'midjourney'
import { buttonsCustom, buttonsImagine, labels } from "../../settings";

export class Photo extends Command {
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

    async function MidjourneyImagine (ctx: IBotContext, prompt: string, id: number) {
      try {
        const initialMessage = await ctx.replyWithPhoto(
          { url: 'https://img.freepik.com/free-vector/vector-damask-seamless-pattern-background-classical-luxury-old-fashioned-damask-ornament-royal-victorian-seamless-texture-for-wallpapers-textile-wrapping-exquisite-floral-baroque-template_1217-738.jpg' },
          { caption: '*Пожалуйста подождите*', parse_mode: 'Markdown' }
        )
        ctx.sendChatAction('typing')
        const Imagine: any = await client.Imagine(prompt || '',
          async (uri, progress) => {
            //console.log("loading", uri, "progress", progress);
            ctx.sendChatAction('typing')
            await ctx.telegram.editMessageMedia(id, initialMessage.message_id, '',
              {
                type: 'photo',
                media: { url: uri },
                caption: `*Прогресс: ${progress}*`,
                parse_mode: 'Markdown'
              }
            );
          }
        );
        ctx.session.Imagine = {
          id: Imagine.id,
          flags: Imagine.flags,
          content: Imagine.content,
          hash: Imagine.hash,
          progress: Imagine.progress,
          uri: Imagine.uri,
          proxy_url: Imagine.proxy_url,
        }
        await ctx.telegram.editMessageMedia(id, initialMessage.message_id, '',
          {
            type: 'photo',
            media: { url: Imagine?.proxy_url || '' },
            caption: `[Ссылка на изображение](${Imagine?.proxy_url})`,
            parse_mode: 'Markdown'
          },
          {
            reply_markup: {
              inline_keyboard: buttonsImagine
            }
          }
        );  
      } catch (error) {
        logger.error(error);
      }
    }
    async function MidjourneyCustom (ctx: IBotContext, customId: string, id: number, label: string) {
      try {
        const initialMessage = await ctx.replyWithPhoto(
          { url: 'https://img.freepik.com/free-vector/vector-damask-seamless-pattern-background-classical-luxury-old-fashioned-damask-ornament-royal-victorian-seamless-texture-for-wallpapers-textile-wrapping-exquisite-floral-baroque-template_1217-738.jpg' },
          { caption: '*Пожалуйста подождите*', parse_mode: 'Markdown' }
        )
        const Custom = await client.Custom({
          msgId: <string>ctx.session.Imagine.id,
          flags: ctx.session.Imagine.flags,
          content: ctx.session.Imagine.content,
          customId: customId,
          loading: async (uri: string, progress: string) => {
            logger.log(progress)
            ctx.sendChatAction('typing')
            await ctx.telegram.editMessageMedia(id, initialMessage.message_id, '',
              {
                type: 'photo',
                media: { url: uri },
                caption: `*Прогресс: ${progress}*`,
                parse_mode: 'Markdown'
              }
            );
          },
        });
        logger.log(Custom)
        //ctx.session.Custom = Custom;
        await ctx.telegram.editMessageMedia(id, initialMessage.message_id, '',
          {
            type: 'photo',
            media: { url: Custom?.proxy_url || '' },
            caption: `[Ссылка на изображение](${Custom?.proxy_url})`,
            parse_mode: 'Markdown'
          },
          {
            reply_markup: {
              inline_keyboard: label.startsWith('U') && !isNaN(+label.substring(1)) ? buttonsCustom : buttonsImagine
            },
          }
        );
        logger.log(Custom)        
      } catch (error) {
        logger.error(error)
      }
    }
    this.bot.on('text', async (ctx) => {
      try {
        const text = ctx.message.text

        let prompt;
        await translate(text, null, "en").then((data) => {
          prompt = data.translation
        });

        ctx.session.prompt = prompt || '';
        await MidjourneyImagine(ctx, prompt || '', ctx.from.id);
      } catch (error) {
        logger.error(error)
      }
    })
    function findCustomByLabel(options: any[], label: any) {
      const foundOption = options.find(option => option.label === label);
      return foundOption ? foundOption.custom : null;
    }
    labels.forEach(label => {
      this.bot.action(label, async (ctx) => {
        try {
          const customId = findCustomByLabel(ctx.session.Imagine.options, label)
          if (label == '🔄') {
            await MidjourneyImagine(ctx, ctx.session.prompt || '', ctx.from?.id || 0);
          } else {
            await MidjourneyCustom(ctx, customId || '', ctx.from?.id || 0, label)
          }
        } catch (error) {
          logger.error(error)
        }
      });
    });
    this.bot.on('photo', async (ctx) => {
      try {
        const photo = ctx.message?.photo;
        const fileId = photo[photo.length - 1].file_id;
        const fileUrl = (await ctx.telegram.getFileLink(fileId)).href;

        const Imagine = await client.Imagine(
          `https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Felis_silvestris_silvestris.jpg/275px-Felis_silvestris_silvestris.jpg https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Savannah_Cat_closeup.jpg/800px-Savannah_Cat_closeup.jpg https://cdn.onemars.net/sites/whiskas_ru_71pCm_mwh5/image/desktop-shutterstock_2230908741_1697033439010.jpeg https://www.cats.org.uk/media/13136/220325case013.jpg`,
          (uri: string, progress: string) => {
            logger.log(`loading, ${uri}, progress, ${progress}`);
          }
        );
        logger.log(Imagine);
      } catch (error) {
        logger.error(error)
      }
    });
  }
}