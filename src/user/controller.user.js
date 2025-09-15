import ChannelMessage from "../model/model.schema.js";

export class UserContoller {
  async start(ctx) {
    
    // Faqat userga DM
    await ctx.api.sendMessage(
      ctx.from.id,
      "Salom Janob, bizga ishonganingizdan xursandmiz!\nIltimos, kino/film kodini yuboring."
    );
  }

  async message(ctx) {
    const text = ctx.message.text?.trim();

    // faqat raqam bo‘lishi kerak
    if (Number(text)) {
      const kod = Number(text);

      // DB dan qidirish
      const videoKode = await ChannelMessage.findOne({ code: kod });

      if (!videoKode) {
        return await ctx.api.sendMessage(
          ctx.from.id,
          `❌ Kod (${kod}) bo‘yicha video topilmadi.`
        );
      }

      try {
        // userga kanal xabarini forward qilish
        await ctx.api.forwardMessage(
          ctx.from.id, // user chat id
          videoKode.channelId, // kanal id
          videoKode.channelMessageId // kanaldagi message_id
        );

        await ctx.api.sendMessage(
          ctx.chat.id,
          `✅ Kod (${kod}) bo‘yicha video topildi. Maroqli xordiq tilayman.`
        );
      } catch (err) {
        console.error("❌ Forward xatolik:", err.message);

        // Faqat userga xatolik xabari
        await ctx.api.sendMessage(
          ctx.chat.id,
          "❌ Malumot yuborishda xatolik yuz berdi. Iltimos biroz vaqtdan keyin qayta urinib ko‘ring."
        );

        // 🔔 Adminga xabar yuborish
        const ADMIN_ID = Number(process.env.ADMIN_ID);
        if (ADMIN_ID) {
          await ctx.api.sendMessage(
            ADMIN_ID,
            `⚠️ Forward qilishda xatolik:\n` +
              `User: ${ctx.from.first_name} (@${
                ctx.from.username || "no-username"
              })\n` +
              `Kod: ${kod}\n` +
              `Xatolik: ${err.message}`
          );
        }
      }
    } else {
      // faqat userga xabar
      await ctx.api.sendMessage(
        ctx.from.id,
        "ℹ️ Iltimos, faqat video yoki film **kodini** yuboring."
      );
    }
  }
}
