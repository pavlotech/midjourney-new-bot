import { Telegraf } from "telegraf";
import { IBotContext } from "../context/context.interface";

export abstract class Event {
  constructor (public bot: Telegraf<IBotContext>) { };
  
  abstract handle (logger: any, database: any): void;
}