import { buttonsCustom, buttonsGenerate } from "../../settings";
import { IBotContext } from "../context/context.interface";

export default async function finalyMessage (ctx: IBotContext, url: string, userId: number, messageId: number, label: string, logger: any) {
  try {
    await ctx.telegram.editMessageMedia(userId, messageId, '',
      {
        type: 'photo',
        media: { url: url },
        caption: `[Ссылка на изображение](${url})`,
        parse_mode: 'Markdown'
      },
      {
        reply_markup: {
          inline_keyboard: (
            ['U1', 'U2', 'U3', 'U4'].includes(label) ? buttonsCustom :
            (!['Upscale (2x)', 'Upscale (4x)'].includes(label) ? buttonsGenerate : [])
          )
        }
      }
    );
  } catch (error) {
    logger.error(error)
  }
}