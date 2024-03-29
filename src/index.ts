import { ConfigService } from "./config/config.service";
import { IConfigService } from './config/config.interface';
import { Telegraf, session, Scenes } from "telegraf";
import { IBotContext, ISceneContext } from "./context/context.interface";
import { Command } from "./commands/command.class";
import { Start } from "./commands/start.command";
import { PrismaClient } from '@prisma/client'
import { Vip } from "./commands/vip.command";
import { Profile } from "./commands/profile.command";
import { Photo } from "./events/photo.event";
import { Logger } from "./types/logger.class";
import { Database } from "./types/database.class";
import { Admin } from "./commands/admin.command";
import { Scene } from "./scenes/admin.scene";
import { Post } from "./commands/post.command";
import { VipScene } from "./scenes/vip.scene";
//import LocalSession from "telegraf-session-local";
import { Ratio } from "./commands/ratio.command";
//import Server from "./types/server.class";
import { Blend } from "./scenes/blend.scene";
import { BlendDescribe } from "./commands/blend.describe.command";
import { Describe } from "./scenes/describe.scene";

export class Bot {
  bot!: Telegraf<IBotContext>;
  prisma: any = new PrismaClient();
  logger: any = new Logger();
  database: any = new Database(this.prisma, this.logger);
  commands: Command[] = [];
  events: Command[] = [];
  
  constructor (private readonly config: IConfigService) {
    this.bot = new Telegraf<IBotContext>(this.config.get('TOKEN'), { handlerTimeout: 60 * 60 * 1000 })
    const scene = new Scene(this.database, this.logger);
    const vip = new VipScene(this.database, this.logger, this.config)
    const blend = new Blend(this.database, this.logger, this.config)
    const describe = new Describe(this.database, this.logger, this.config)
    const stage = new Scenes.Stage<ISceneContext>([
      scene.create_announcement(),
      scene.remove_announcement(),
      scene.get_text(),
      scene.post(),
      scene.get_button(),
      scene.remove_admin(),
      scene.ban_user(),
      scene.unban_user(),
      scene.profile_user(),
      scene.give_requests(),
      scene.take_away_requests(),
      scene.give_requests_cb(),
      scene.take_away_requests_cb(),
      scene.add_word(),
      scene.remove_word(),
      vip.get_email(),
      blend.first_photo(),
      blend.second_photo(),
      describe.get_photo(),
      describe.get_text()
    ], { ttl: 10 * 60 * 1000 });
    this.bot.use(session())
    //this.bot.use(new LocalSession({ database: 'session.json' }))
    this.bot.use(stage.middleware());  
  }
  init () {
    //new Server(this.logger, this.config).init();
    this.commands = [
      new Start(this.bot, this.config),
      new Vip(this.bot, this.config),
      new Profile(this.bot),
      new Ratio(this.bot),
      new Post(this.bot),
      new Admin(this.bot),
      new BlendDescribe(this.bot)
    ]
    for (const command of this.commands) command.handle(this.logger, this.database);

    this.events = [
      new Photo(this.bot, this.config),
    ]
    for (const event of this.events) event.handle(this.logger, this.database);

    this.bot.telegram.setMyCommands([
      {
        command: 'start',
        description: 'Запустить бота',
      },
      {
        command: 'vip',
        description: 'Купить подписку',
      },
      {
        command: 'my_profile',
        description: 'Мой профиль'
      },
      {
        command: 'ratio',
        description: 'Смена соотношения сторон (1:1, 4:3, 16:9)'
      },
      {
        command: 'blend',
        description: 'Генерация на основе двух изображений'
      },
      {
        command: 'describe',
        description: 'Генерация фото + текст'
      },
    ])
    this.bot.launch()
    this.logger.info('bot started')
  }
}
const bot = new Bot(new ConfigService());
bot.init()