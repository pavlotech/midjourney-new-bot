import { ISceneContext } from "../context/context.interface";

export class Announcement {
  private database: any;
  private logger: any;

  constructor (database: any, logger: any) {
    this.database = database;
    this.logger = logger;
  }

  public async post (ctx: ISceneContext, response: string)  {
    const data = await this.database.findUnique('announcement', { id: response });
    if (data) {
      ctx.reply(`*Рассылка началась!*`, { parse_mode: 'Markdown' })

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
      }
          
      const users = await this.database.findMany('user');
      const userIds = users.map((user: { userId: number }) => user.userId);
      //this.logger.log(userIds)
      const params: any = {
        caption: data.text,
        reply_markup: {
          inline_keyboard: buttonArrays,
        },
        parse_mode: 'Markdown',
      };
      let errorsCount = 0;
          
      for (const userId of userIds) {
        try {
          if (data.media) {
            if (data.media.endsWith('.mp4')) {
              await ctx.telegram.sendVideo(Number(userId), { url: data.media }, params);
            } else if (data.media.endsWith('.jpg') || data.media.endsWith('.jpeg') || data.media.endsWith('.png')) {
              await ctx.telegram.sendPhoto(Number(userId), { url: data.media }, params);
            }
          } else {
            await ctx.telegram.sendMessage(Number(userId), { text: data.text }, {
              reply_markup: {
                inline_keyboard: buttonArrays,
              },
              parse_mode: 'Markdown',
            });
          }
          this.logger.info(`successfully sent message to user ${Number(userId)}`);
        } catch (error) {
          this.logger.error(`error sending message to user ${Number(userId)}:`);
          errorsCount++;
        }
      }
      ctx.reply(`Рассылка завершена!\nУспешно: ${userIds.length - errorsCount}\nЗаблокировано: ${errorsCount}\n`)
      this.logger.info(`total users: ${userIds.length}`);
      this.logger.info(`total errors: ${errorsCount}`);

      ctx.scene.leave();
    } else {
      ctx.reply(`*Обьявление не найдено*`, { parse_mode: 'Markdown' })
      ctx.scene.leave()
    }
  }
}