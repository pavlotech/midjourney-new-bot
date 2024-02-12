import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IBotContext } from "../context/context.interface";
import * as fs from 'fs';
import * as path from 'path';

export class Profile extends Command {
  constructor (bot: Telegraf<IBotContext>) {
    super(bot);
  }
  handle (logger: any, database: any): void {
    this.bot.command('my_profile', async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: ctx.from.id })
        if (!user) return;
        if (user.ban) return;
        ctx.reply(`
*ID:* \`${ctx.from.id}\`
Остаток запросов: ${user.subscribe}

Пополнить баланс - /vip`, { parse_mode: 'Markdown' }
        )
        logger.info(`${ctx.from.id} - https://t.me/${ctx.from.username} use /my_profile`)
      } catch (error) {
        logger.error(error)
      }
    })


    
    this.bot.command('migrate_84375875', async (ctx) => {
      try {
        const user = await database.findUnique('user', { userId: ctx.from.id })
        if (!user || user.ban) return;
        if (!user.admin) return logger.warn(`${ctx.from?.id} - https://t.me/${ctx.from?.username} tried to log into the migrate`)

        function convertToUnix(dateString: string): number {
          const date = new Date(dateString);
          const milliseconds = date.getTime();
          const seconds = Math.floor(milliseconds / 1000);
          const decimalPart = Number(`0.${milliseconds.toString().split('.')[1]}`) || 0; // извлекаем десятичную часть миллисекунд
          return seconds + decimalPart;
        }
        const processFiles = async () => {
          const directory = path.join(__dirname, '../../../users'); // путь к папке с файлами
          const files = fs.readdirSync(directory); // список файлов в папке

          for (const file of files) {
            const filePath = path.join(directory, file);
            if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.json') {
              try {
                const userData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                await database.delete('user', {
                  userId: typeof userData.username === 'string' ? Number(userData.username) : userData.username,
                  registry: convertToUnix(userData.registry),
                  subscribe: typeof userData.subscribe === 'string' ? Number(userData.subscribe) : userData.subscribe,
                  prompt: '',
                  ratio: '1:1',
                  lastPay: convertToUnix(userData.payment),
                  treatment: false,
                  admin: false,
                  ban: false,
                  banDate: 0
                });
                logger.info(`The entry for user ${userData.username} was successfully added to the database`);
              } catch (error) {
                logger.error(`Error processing file ${file}: ${error}`);
              }
            }
          }
        }
        processFiles();
      } catch (error) {
        logger.error(error)
      }
    })
  }
}