import { Scenes } from "telegraf";
import { ISceneContext } from "../context/context.interface";
import { Generation } from "../types/generation.class";
import { describe_blend, generationButtons } from "../../settings";
import { downloadAndSavePhoto } from "../functions/download.function";
import { checkAndCorrectHyphen, checkList } from "../functions/check.function";
import { translate } from "bing-translate-api";
import { uploadImageToImgBB } from "../functions/upload.function";

export class Describe {
  private config: any;
  private logger: any;
  private database: any;
  private url: Map<number, string> = new Map<number, string>();

  constructor(database: any, logger: any, config: any) {
    this.database = database;
    this.logger = logger;
    this.config = config;
  }
  public get_photo () {
    const scene = new Scenes.BaseScene<ISceneContext>('describe_get_photo');
    let timeoutId: NodeJS.Timeout;

    scene.enter(async (ctx) => {
      ctx.reply(describe_blend.photo, { parse_mode: 'Markdown' })
      timeoutId = setTimeout(() => {
        ctx.reply(describe_blend.waiting_time, { parse_mode: 'Markdown' });
        ctx.scene.leave();
      }, 3 * 60 * 1000);
    })
    scene.on('photo', async (ctx) => {
      try {
        clearTimeout(timeoutId);
        const photo = ctx.message?.photo;
        const fileId = photo[photo.length - 1].file_id;
        const fileUrl = (await ctx.telegram.getFileLink(fileId)).href;
        const uploadResult = await uploadImageToImgBB(fileUrl, this.config.get('API_KEY'), this.logger);

        this.url.set(ctx.from.id, uploadResult.data.url)
        ctx.scene.enter('describe_get_text')
      } catch (error) {
        this.logger.error(error)
        this.url.delete(ctx.from.id)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public get_text () {
    const scene = new Scenes.BaseScene<ISceneContext>('describe_get_text');
    let timeoutId: NodeJS.Timeout;

    scene.enter(async (ctx) => {
      ctx.reply(describe_blend.text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Пропустить', callback_data: 'skip' }]
          ]
        },
        parse_mode: 'Markdown'
      })
      timeoutId = setTimeout(async () => {
        ctx.reply(describe_blend.waiting_time, { parse_mode: 'Markdown' });
        this.url.delete(ctx.from?.id || 0)
        ctx.scene.leave();
      }, 3 * 60 * 1000);
    })
    scene.action('skip', async (ctx) => {
      try {
        clearTimeout(timeoutId);
        const user = await this.database.findUnique('user', { userId: ctx.from?.id })
        await this.database.update('user', { userId: ctx.from?.id }, {
          treatment: true
        })

        const url = this.url.get(ctx.from?.id || 0)
        this.url.delete(ctx.from?.id || 0)
        new Generation(this.database, this.logger, this.config).generation(ctx, user, 'describe', {
          image_url: url,
          process_mode: "fast",
        }, generationButtons);
      } catch (error) {
        this.logger.error(error)
        this.url.delete(ctx.from?.id || 0)
        ctx.scene.leave();
      }
    });
    scene.on('text', async (ctx) => {
      try {
        clearTimeout(timeoutId);
        const user = await this.database.findUnique('user', { userId: ctx.from.id })
        const prompt = (await translate(checkAndCorrectHyphen(ctx.message.text), null, "en")).translation.toLowerCase();
        if (checkList(prompt)) return ctx.reply(`*Запрос "${ctx.message.text}" не прошел модерацию*`, { parse_mode: 'Markdown' })

        await this.database.update('user', { userId: ctx.from.id }, {
          prompt: `${this.url.get(ctx.from.id)} ${prompt}`,
          treatment: true
        })

        const url = this.url.get(ctx.from.id)
        this.url.delete(ctx.from.id)
        

        new Generation(this.database, this.logger, this.config).generation(ctx, user, 'imagine', {
          prompt: `${url} ${prompt}`,
          process_mode: "fast",
        }, generationButtons);
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        this.url.delete(ctx.from.id)
        ctx.scene.leave()
      }
    })
    return scene
  }
}