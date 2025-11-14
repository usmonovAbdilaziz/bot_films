import ChannelMessage from "../model/model.schema.js";

export class UserContoller {
  async start(ctx) {
    await ctx.api.sendMessage(
      ctx.from.id,
      "Salom! Iltimos, video kodini yuboring."
    );
  }

  async message(ctx) {
    const text = ctx.message.text?.trim();
    const userId = ctx.from.id;
    const username = ctx.from.username || "no-username";
    const firstName = ctx.from.first_name || "Unknown";

    // Raqam emasligini tekshirish
    if (!Number(text)) {
      // Userga xabar
      await ctx.api.sendMessage(
        userId,
        `Iltimos bu botga faqat video kodini yuboring.Siz yuborgan xabar: ${text}`
      );

      // Adminga xabar
      const ADMIN_ID = Number(process.env.ADMIN_ID);
      if (ADMIN_ID) {
        await ctx.api.sendMessage(
          ADMIN_ID,
          `User noto'g'ri xabar yubordi:\n` +
            `Name: ${firstName}\n` +
            `Username: @${username}\n` +
            `User ID: ${userId}\n` +
            `Xabar: "${text}"`
        );
      }
      return;
    }

    const kod = Number(text);
    let videoKode = null;

    try {
      // DB dan qidirish
      videoKode = await ChannelMessage.findOne({ code: kod });

      if (!videoKode) {
        return await ctx.api.sendMessage(
          userId,
          `Bu (${kod}) bo'yicha ma'lumot topilmadi.`
        );
      }

      // Forward qilish
      await ctx.api.forwardMessage(
        userId,
        videoKode.channelId,
        videoKode.channelMessageId
      );
    } catch (error) {
      // Faqat adminga batafsil xabar
      const ADMIN_ID = Number(process.env.ADMIN_ID);
      if (ADMIN_ID) {
        await ctx.api.sendMessage(
          ADMIN_ID,
          `❌ Forward xatolik:\n` +
            `User: ${firstName} (@${username})\n` +
            `User ID: ${userId}\n` +
            `Kod: ${kod}\n` +
            `Channel ID: ${videoKode?.channelId || "undefined"}\n` +
            `Message ID: ${videoKode?.channelMessageId || "undefined"}\n` +
            `Error Code: ${error.error_code || "none"}\n` +
            `Xatolik: ${error.message}`
        );
      }
    }
  }
}
