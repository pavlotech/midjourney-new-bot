import { Scenes } from "telegraf";
import { ISceneContext } from "../context/context.interface";
import { translate } from 'bing-translate-api';
import * as fs from 'fs';
import { Announcement } from "../types/announcement.class";

export class Scene {
  private dataId: Map<number, string> = new Map<number, string>();
  private userId: Map<number, number> = new Map<number, number>();
  private database: any
  private logger: any
  private reply: string = '*Введите ID пользователя*'
  private notNumber: string = '*ID должен быть числовым значением!*'

  constructor(database: any, logger: any) {
    this.database = database;
    this.logger = logger;
  }
  private isNumber (str: string) {
    return /^\d+$/.test(str);
  };
  public create_announcement () {
    const scene = new Scenes.BaseScene<ISceneContext>('create_announcement')
    scene.enter(async (ctx) => {
      const data = await this.database.create('announcement', { 
        media: '',
        text: '',
        button: ''
      })
      this.dataId.set(ctx.from?.id || 0, data.id)
      ctx.reply(`*Отправьте видео или фото размером не более 50мб*`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Пропустить`, callback_data: 'skip_media'}],
            [{ text: `Отменить`, callback_data: 'cancel' }]
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        const id = this.dataId.get(ctx.from?.id ||0)
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        await this.database.delete('announcement', { id: id })
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.action('skip_media', async (ctx) => {
      ctx.scene.enter('get_text')
    })
    scene.on('photo', async (ctx) => {
      try {
        const photo = ctx.message.photo;
        const fileId = photo[photo.length - 1].file_id;
        const fileUrl = (await ctx.telegram.getFileLink(fileId)).href;

        //media.push(fileUrl)

        const id = this.dataId.get(ctx.from?.id)
        await this.database.update('announcement', { id: id }, { media: fileUrl });
        ctx.scene.enter('get_text');
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('document', async (ctx) => {
      try {
        const fileId = ctx.message.document.file_id
        const fileUrl = (await ctx.telegram.getFileLink(fileId)).href;

        //media.push(fileUrl)

        const id = this.dataId.get(ctx.from?.id)
        await this.database.update('announcement', { id: id }, { media: fileUrl });
        ctx.scene.enter('get_text');
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('video', async (ctx) => {
      try {
        const fileId = ctx.message.video.file_id
        const fileUrl = (await ctx.telegram.getFileLink(fileId)).href;

        //media.push(fileUrl)

        const id = this.dataId.get(ctx.from?.id)
        await this.database.update('announcement', { id: id }, { media: fileUrl });
        ctx.scene.enter('get_text');
      } catch (error) {
        ctx.reply(`*Видео больше 50 мб*`, { parse_mode: 'Markdown' })
        this.logger.error(error)
        ctx.scene.reenter()
      }
    })
    return scene
  }
  public remove_announcement () {
    const scene = new Scenes.BaseScene<ISceneContext>('remove_announcement')
    scene.enter(async (ctx) => {
      ctx.reply(`*Введите ID обьявления*`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel' }]
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text
        await this.database.delete('announcement', { id: response });
        ctx.reply(`*Обьявление удалено*`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: `Создать новое`, callback_data: 'create_new'}]
            ]
          },
          parse_mode: 'Markdown'
        })
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.reply(`*Обьявление не найдено*`, { parse_mode: 'Markdown' })
        ctx.scene.leave()
      }
    })
    return scene
  }
  public get_text () {
    const scene = new Scenes.BaseScene<ISceneContext>('get_text')
    scene.enter(async (ctx) => {
      ctx.reply(`*Отправьте текст обьявления\n\nТекст обьявления\nСсылка - [текст ссылки](ссылка)*`, { parse_mode: 'Markdown' })
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text
        const id = this.dataId.get(ctx.from?.id)
        await this.database.update('announcement', { id: id }, { text: response })
        
        ctx.scene.enter('get_button')
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public post () {
    const scene = new Scenes.BaseScene<ISceneContext>('post')
    scene.enter(async (ctx) => {
      ctx.reply(`*Введите ID обьявления*`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel' }]
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text
        ctx.scene.leave()
        new Announcement(this.database, this.logger).post(ctx, response)
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave();
      }
    })
    return scene
  }
  public get_button () {
    const scene = new Scenes.BaseScene<ISceneContext>('get_button')
    scene.enter(async (ctx) => {
      ctx.reply(`*Отправьте кнопки в таком формате\n\n[текст кнопки](ссылка)\n[текст кнопки](ссылка)*`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Пропустить`, callback_data: 'skip_button'}],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('skip_button', async (ctx) => {
      try {
        ctx.reply(`*Обьявление собрано выберите действие*`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: `Показать результат`, callback_data: 'look_announcement'}],
              [{ text: `Сохранить`, callback_data: 'save_announcement'}],
              [{ text: `Удалить`, callback_data: 'remove_announcement' }]
            ]
          },
          parse_mode: 'Markdown'
        })
      } catch (error) {
        this.logger.error(error)
      }
    })
    scene.action('save_announcement', async (ctx) => {
      try {
        const id = this.dataId.get(ctx.from?.id || 0)
        ctx.reply(`*Обьявление сохранено используйте команду /post\nID: *\`${id}\``, { parse_mode: 'Markdown' })
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.action('remove_announcement', async (ctx) => {
      try {
        const id = this.dataId.get(ctx.from?.id || 0)
        await this.database.delete('announcement', { id: id })
        ctx.reply(`*Обьявление удалено*`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: `Создать новое`, callback_data: 'create_new' }],
              [{ text: `Завершить`, callback_data: 'cancel' }]
            ]
          },
          parse_mode: 'Markdown'
        })
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave();
      }
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Завершено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.action('create_new', async (ctx) => {
      try {
        ctx.scene.enter('create_announcement')
      } catch (error) {
        this.logger.error()
        ctx.scene.leave()
      }
    })
    scene.action('look_announcement', async (ctx) => {
      try {
        const id = this.dataId.get(ctx.from?.id || 0)
        //this.logger.log(id)
        const data = await this.database.findUnique('announcement', { id: id });

        if (data) {
          const buttonArrays: { text: string; url: string }[][] = [];
          if (data.button) {
            const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let match;
            while ((match = regex.exec(data.button)) !== null) {
              const text = match[1];
              const url = match[2];
              const button = [{ text, url }];
              buttonArrays.push(button);
            }
            //this.logger.log(buttonArrays);
          }
          const params: any = {
            caption: data.text,
            reply_markup: {
              inline_keyboard: buttonArrays,
            },
            parse_mode: 'Markdown',
          };
          if (data.media) {
            if (data.media.endsWith('.mp4')) {
              await ctx.replyWithVideo({ url: data.media }, params);
            } else if (data.media.endsWith('.jpg') || data.media.endsWith('.jpeg') || data.media.endsWith('.png')) {
              await ctx.replyWithPhoto({ url: data.media }, params);
            }
          } else {
            await ctx.reply({ text: data.text }, {
              reply_markup: {
                inline_keyboard: buttonArrays,
              },
              parse_mode: 'Markdown',
            });
          }
        }
        ctx.reply(`*Выберите действие*`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: `Сохранить`, callback_data: 'save_announcement'}],
              [{ text: `Удалить`, callback_data: 'remove_announcement' }]
            ]
          },
          parse_mode: 'Markdown'
        });
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave();
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text;

        const id = this.dataId.get(ctx.from?.id)
        await this.database.update('announcement', { id: id }, { button: response });

        ctx.reply(`*Обьявление собрано выберите действие*`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: `Показать результат`, callback_data: 'look_announcement'}],
              [{ text: `Сохранить`, callback_data: 'save_announcement'}],
              [{ text: `Удалить`, callback_data: 'remove_announcement' }]
            ]
          },
          parse_mode: 'Markdown'
        })
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public remove_admin () {
    const scene = new Scenes.BaseScene<ISceneContext>('remove_admin')
    scene.enter(async (ctx) => {
      ctx.reply(this.reply, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel'}],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text

        if (this.isNumber(response)) {
          const id = Number(response);
          await this.database.update('user', { userId: id }, { admin: false })
          ctx.reply(`*ID:* \`${id}\` *права администратора удалены*`, { parse_mode: 'Markdown' })
          this.logger.info(`${id} no longer an administrator`)
          ctx.scene.leave()
        } else {
          ctx.reply(this.notNumber, { parse_mode: 'Markdown' })
          ctx.scene.reenter()
        }
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public ban_user () {
    const scene = new Scenes.BaseScene<ISceneContext>('ban_user')
    scene.enter(async (ctx) => {
      ctx.reply(this.reply, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel'}],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text

        if (this.isNumber(response)) {
          const id = Number(response);
          await this.database.update('user', { userId: id }, { ban: true, banDate: Date.now() })
          ctx.reply(`*ID:* \`${id}\` *забанен*`, { parse_mode: 'Markdown' })
          this.logger.info(`${id} banned`)
          ctx.scene.leave()
        } else {
          ctx.reply(this.notNumber, { parse_mode: 'Markdown' })
          ctx.scene.reenter()
        }
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public unban_user () {
    const scene = new Scenes.BaseScene<ISceneContext>('unban_user')
    scene.enter(async (ctx) => {
      ctx.reply(this.reply, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel'}],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text

        if (this.isNumber(response)) {
          const id = Number(response);
          await this.database.update('user', { userId: id }, { ban: false, banDate: 0 })
          ctx.reply(`*ID:* \`${id}\` *разбанен*`, { parse_mode: 'Markdown' })
          this.logger.info(`${id} unbanned`)
          ctx.scene.leave()
        } else {
          ctx.reply(this.notNumber, { parse_mode: 'Markdown' })
          ctx.scene.reenter()
        }
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public profile_user () {
    const scene = new Scenes.BaseScene<ISceneContext>('profile_user')
    scene.enter(async (ctx) => {
      ctx.reply(this.reply, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel'}],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text

        if (this.isNumber(response)) {
          const id = Number(response);
          const user = await this.database.findUnique('user', { userId: id })
          ctx.reply(`
*ID:* \`${user.userId}\`
*Дата регистрации: ${new Date(Number(user.registry)).toLocaleDateString()}
Использований: ${user.subscribe}
Последний запрос: ${user.last}
Последний платеж: ${user.lastPay === 0 ? 'Пусто' : new Date(Number(user.lastPay)).toLocaleDateString()}
Админ: ${user.admin ? 'Да' : 'Нет'}
Забанен: ${user.ban ? 'Да' : 'Нет'}
Дата блокировки: ${user.banDate === 0 ? 'Пусто' : new Date(Number(user.banDate)).toLocaleDateString()}
  *`, { parse_mode: 'Markdown' })
          this.logger.info(`${ctx.from.id} viewed user profile id: ${id}`)
          ctx.scene.leave()
        } else {
          ctx.reply(this.notNumber, { parse_mode: 'Markdown' })
          ctx.scene.reenter()
        }
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public give_requests () {
    const scene = new Scenes.BaseScene<ISceneContext>('give_requests')
    scene.enter(async (ctx) => {
      ctx.reply(this.reply, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel'}],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text

        if (this.isNumber(response)) {
          const id = Number(response);
          this.userId.set(ctx.from.id, id)
          ctx.scene.enter('give_requests_cb')
        } else {
          ctx.reply(this.notNumber, { parse_mode: 'Markdown' })
          ctx.scene.reenter()
        }
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public give_requests_cb () {
    const scene = new Scenes.BaseScene<ISceneContext>('give_requests_cb')
    scene.enter(async (ctx) => {
      ctx.reply(`*Введите количество*`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel'}],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text

        if (this.isNumber(response)) {
          const num = Number(response);
          const id = this.userId.get(ctx.from?.id)
          ctx.reply(`*ID:* \`${id}\` *+${num} запросов*`, { parse_mode: 'Markdown' })
          const user = await this.database.findUnique('user', { userId: id })
          this.logger.info(`${id} +${num} requests`)

          await this.database.update('user', { userId: id }, { subscribe: user.subscribe + num })
          ctx.scene.leave()
        } else {
          ctx.reply(this.notNumber, { parse_mode: 'Markdown' })
          ctx.scene.reenter()
        }
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public take_away_requests () {
    const scene = new Scenes.BaseScene<ISceneContext>('take_away_requests')
    scene.enter(async (ctx) => {
      ctx.reply(this.reply, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel'}],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text

        if (this.isNumber(response)) {
          const id = Number(response);
          this.userId.set(ctx.from.id, id)
          ctx.scene.enter('take_away_requests_cb')
        } else {
          ctx.reply(this.notNumber, { parse_mode: 'Markdown' })
          ctx.scene.reenter()
        }
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public take_away_requests_cb () {
    const scene = new Scenes.BaseScene<ISceneContext>('take_away_requests_cb')
    scene.enter(async (ctx) => {
      ctx.reply(`*Введите количество*`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel' }],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown' })
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const response = ctx.message.text

        if (this.isNumber(response)) {
          const num = Number(response);
          const id = this.userId.get(ctx.from?.id)
          ctx.reply(`*ID:* \`${id}\` *-${num} запросов*`, { parse_mode: 'Markdown' })
          this.logger.info(`${id} -${num} requests`)

          const user = await this.database.findUnique('user', { userId: id })
          await this.database.update('user', { userId: id }, { subscribe: user.subscribe - num })
          ctx.scene.leave()
        } else {
          ctx.reply(this.notNumber, { parse_mode: 'Markdown' })
          ctx.scene.reenter()
        }
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public add_word () {
    const scene = new Scenes.BaseScene<ISceneContext>('add_word')
    scene.enter(async (ctx) => {
      ctx.reply(`*Введите слово*`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel' }],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const result = (await translate(ctx.message.text, null, "en")).translation;
        fs.appendFile('banList.txt', `${result}\r\n`, () => {});

        ctx.reply(`*Слово ${result} добавлено*`, { parse_mode: 'Markdown' })
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
  public remove_word () {
    const scene = new Scenes.BaseScene<ISceneContext>('remove_word')
    scene.enter(async (ctx) => {
      ctx.reply(`*Введите слово*`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Отменить`, callback_data: 'cancel' }],
          ]
        },
        parse_mode: 'Markdown'
      })
    })
    scene.action('cancel', async (ctx) => {
      try {
        ctx.reply(`*Отменено*`, { parse_mode: 'Markdown'})
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    scene.on('text', async (ctx) => {
      try {
        const result = (await translate(ctx.message.text, null, "en")).translation;

        const currentContent = fs.readFileSync('banList.txt', 'utf-8');

        const replace = currentContent.replace(new RegExp(`${result}\r\n`, 'g'), '');

        fs.writeFileSync('banList.txt', replace);

        ctx.reply(`*Слово ${result} удалено*`, { parse_mode: 'Markdown' })
        ctx.scene.leave()
      } catch (error) {
        this.logger.error(error)
        ctx.scene.leave()
      }
    })
    return scene
  }
}