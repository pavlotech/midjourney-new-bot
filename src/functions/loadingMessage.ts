import { IBotContext } from "../context/context.interface";

export default async function loadingMessage (ctx: IBotContext, url: string, userId: number, messageId: number, progress: string, logger: any) {
  try {
    ctx.sendChatAction('typing')
    await ctx.telegram.editMessageMedia(userId, messageId, '',
      {
        type: 'photo',
        media: { url: url },
        caption: `*Прогресс: ${progress}*`,
        parse_mode: 'Markdown'
      }
    );        
  } catch (error) {
    logger.error(error);
  }
}