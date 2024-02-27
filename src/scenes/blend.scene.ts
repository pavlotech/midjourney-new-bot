import { Scenes } from "telegraf";
import { ISceneContext } from "../context/context.interface";
import { Generation } from "../types/generation.class";
import { describe_blend, generationButtons } from "../../settings";
import { downloadAndSavePhoto } from "../functions/download.function";
import { uploadImageToImgBB } from "../functions/upload.function";
/* import fs from 'fs';
import path from 'path'; */

export class Blend {
  private config: any;
  private logger: any;
  private database: any;
  private urls: Map<number, string[]> = new Map<number, string[]>();

  constructor(database: any, logger: any, config: any) {
    this.database = database;
    this.logger = logger;
    this.config = config;
  }
  public first_photo () {
    const scene = new Scenes.BaseScene<ISceneContext>('blend_first_photo');
    let timeoutId: NodeJS.Timeout;

    scene.enter(async (ctx) => {
      ctx.reply(describe_blend.first_photo, { parse_mode: 'Markdown' })
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

        this.urls.set(ctx.from.id, [ uploadResult.data.url ]);
        ctx.scene.enter('blend_second_photo')
      } catch (error) {
        this.logger.error(error)
        this.urls.delete(ctx.from.id)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public second_photo () {
    const scene = new Scenes.BaseScene<ISceneContext>('blend_second_photo');
    let timeoutId: NodeJS.Timeout;

    scene.enter(async (ctx) => {
      ctx.reply(describe_blend.second_photo, { parse_mode: 'Markdown' })
      timeoutId = setTimeout(async () => {
        ctx.reply(describe_blend.waiting_time, { parse_mode: 'Markdown' });
        this.urls.delete(ctx.from?.id || 0)
        ctx.scene.leave();
      }, 3 * 60 * 1000);
    })
    scene.on('photo', async (ctx) => {
      try {
        clearTimeout(timeoutId);
        const user = await this.database.findUnique('user', { userId: ctx.from.id })
        const photo = ctx.message?.photo;
        const fileId = photo[photo.length - 1].file_id;
        const fileUrl = (await ctx.telegram.getFileLink(fileId)).href;
        
        const uploadResult = await uploadImageToImgBB(fileUrl, this.config.get('API_KEY'), this.logger);
        const currentUrls = this.urls.get(ctx.from.id)
        currentUrls?.push(uploadResult.data.url);

        this.logger.log(currentUrls)

        await this.database.update('user', { userId: ctx.from.id }, {
          treatment: true
        })
        this.urls.delete(ctx.from.id)
        new Generation(this.database, this.logger, this.config).generation(ctx, user, 'blend', {
          image_urls: currentUrls,
          process_mode: "fast",
        }, generationButtons);
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        this.urls.delete(ctx.from.id)
        ctx.scene.leave()
      }
    })
    return scene
  }
}