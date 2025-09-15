import Channel from "../model/model.channel.schema.js";
import { InlineKeyboard } from "grammy";

export const AuthGuard = async (ctx, next) => {
  try {
    const userId = ctx.from.id;

    // DB dan barcha kanallarni olamiz
    const channels = await Channel.find();

    if (!channels.length) {
      return next();
    }

    let notJoined = [];

    for (let ch of channels) {
      try {
        const member = await ctx.api.getChatMember(ch.channelId, userId);

        if (
          member.status !== "member" &&
          member.status !== "administrator" &&
          member.status !== "creator"
        ) {
          notJoined.push(ch);
        }
      } catch (err) {
        console.error(
          `❌ Kanal tekshirishda xato: ${ch.channelId}`,
          err.message
        );
        notJoined.push(ch);
      }
    }

    if (notJoined.length > 0) {
      const keyboard = new InlineKeyboard();
      notJoined.forEach((ch, idx) => {
        keyboard.url(`➕ ${idx + 1}-kanalga a’zo bo‘lish`, ch.link);
      });

      // ✅ Faqat userga yuboradi
      await ctx.reply(
        "❌ Siz barcha kanallarga a’zo bo‘lishingiz kerak.\nQuyidagi kanallarga qo‘shiling:",
        { reply_markup: keyboard }
      );

      return;
    }

    return next();
  } catch (error) {
    console.error("AuthGuard error:", error.message);

    // ✅ Faqat userga yuboradi
    await ctx.reply(
      "❌ Tekshirishda xatolik yuz berdi, keyinroq urinib ko‘ring."
    );
  }
};
