import { TelegramError } from "telegraf";
import { IBotContext } from "../context/context.interface";
import axios from "axios";
import { errorMessage } from '../../settings';

export class Generation {
  private database: any;
  private logger: any;
  private config: any;

  constructor (database: any, logger: any, config: any) {
    this.database = database;
    this.logger = logger;
    this.config = config;
  }
  private request = async (entity: string, data: any) =>
    await axios({
      headers: {
        "X-API-KEY": this.config.get('X_API_KEY'),
      },
      data: data,
      url: `https://api.midjourneyapi.xyz/mj/v2/${entity}`,
      method: 'post'
    }).catch((error: any) => this.logger.error(error));

    private fetchData = async (ctx: IBotContext, task_id: string, counter: number = 0): Promise<any> => {
      try {
        if (counter >= 180) {
          return;
        }
        await ctx.sendChatAction("upload_photo");
        const fetch = await this.request("fetch", {
          task_id: task_id,
        })
        //this.logger.log(fetch)
        if (fetch.data.status !== "finished") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return this.fetchData(ctx, task_id, counter + 1);
        }
        return fetch.data;
      } catch (error) {
        this.logger.error(error)
      }
    };
  public generation = async (ctx: IBotContext, user: any, action: string, params: any, buttons: any) => {
    let fetchResult: any
    try {
      const generate = await this.request(action, params)
      const fetch = await this.fetchData(ctx, generate.data.task_id)

      await this.database.create('task', {
        task_id: fetch.task_id,
        userId: user.userId,
        date: Date.now()
      })
      fetchResult = fetch
      await ctx.replyWithPhoto(
        {
          url: fetch.task_result.image_url
        }, {
          caption: `[Ссылка на изображение](${fetch.task_result.image_url})`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: buttons
          }
        }
      )
      await this.database.update('user', { userId: user.userId }, {
        subscribe: user.subscribe - 1,
        treatment: false,
      })
    } catch (error) {
      if (error instanceof TelegramError) {
        if (error.response.description.startsWith('Bad Request: file')) {
          await ctx.reply(`*Файл слишком большой*\n[Ссылка на изображение](${fetchResult.task_result.discord_image_url})`,
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: buttons
              }
            }
          )
          await this.database.update('user', { userId: user.userId }, {
            subscribe: user.subscribe - 1,
            treatment: false
          })
        }
      } else {
        await this.database.update('user', { userId: user.userId }, {
          treatment: false
        })
        ctx.reply(errorMessage, { parse_mode: 'Markdown' })
        this.logger.error(error)
      }
    }
  }
}