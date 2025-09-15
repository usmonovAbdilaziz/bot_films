import ChannelMessage from "../model/model.schema.js";
import Channel from '../model/model.channel.schema.js'

let kode = 0; // global kod saqlash

export class AdminController {
  async start(ctx) {
    ctx.reply("Salom janob botga xush kelibsiz");
  }

  async video(ctx) {
    try {
      // faqat global koddan foydalanamiz
      const code = kode;

      // Agar kod yo‘q yoki noto‘g‘ri bo‘lsa
      if (!code || isNaN(Number(code))) {
        const lastMsg = await ChannelMessage.findOne().sort({ createdAt: -1 });
        const lastCode = lastMsg ? lastMsg.code : 0;

        return ctx.reply(
          `❌ Avval "Code:XX" yuboring!\nMisol: Code:11\nOxirgi foydalanilgan kod: ${lastCode}`
        );
      }

      // DB da shu kod borligini tekshirish
      const exist = await ChannelMessage.findOne({ code });
      if (exist) {
        return ctx.reply(`⚠️ Bu kod (${code}) allaqachon ishlatilgan!`);
      }

      const channelId = process.env.CHANNEL_ID;

      // Videoni kanalga yuborish
      const sentMessage = await ctx.api.sendVideo(
        channelId,
        ctx.message.video.file_id,
        {
          caption: `${ctx.message.video.file_name}\nJoylashuv raqami: ${code}`,
        }
      );

      // DB ga saqlash
      await ChannelMessage.create({
        code: code,
        text: ctx.message.video.file_name || "video",
        channelMessageId: sentMessage.message_id,
        channelId: String(channelId),
      });

      // ishlatilgan kodni reset qilamiz
      kode = 0;

      ctx.reply(
        `✅ Video kanalga yuborildi va DB ga saqlandi.\n📌 Joylashuv raqami: ${code}`
      );
    } catch (error) {
      console.error("❌ Video saqlashda xatolik:", error.message);
      ctx.reply(
        "❌ Video saqlashda xatolik yuz berdi, keyinroq urinib ko‘ring."
      );
    }
  }
  async message(ctx) {
    const text = ctx.message.text?.trim(); // text bo‘lmasa undefined bo‘ladi

    // agar text umuman yo‘q bo‘lsa (masalan, video yuborilgan bo‘lsa)
    if (!text) {
      return ctx.reply("⚠️ Iltimos, matn yuboring yoki Code yuboring.");
    }

    // Code:xx formatini tekshirish
    if (text.startsWith("Code:")) {
      const extractedCode = text.split(":")[1]?.trim();

      if (extractedCode && !isNaN(Number(extractedCode))) {
        kode = Number(extractedCode);
        return ctx.reply(
          `✅ Kod (${kode}) muvaffaqiyatli saqlandi. Endi video yuboring.`
        );
      } else {
        return ctx.reply("⚠️ Kod formati noto‘g‘ri. Misol: Code:11");
      }
    }

    // oddiy xabar
    ctx.reply(`📩 Siz yuborgan xabar: "${text}"`);
  }

  //channel ustida ishlash

  // ➕ Kanal qo‘shish
  async create(ctx) {
    try {
      const parts = ctx.message.text.split(" ");
      const channelId = parts[2];
      const link = parts[3];
      const adminId = ctx.message.from.id;

      if (!channelId || !link) {
        return ctx.reply("⚠️ Format: /channel add <channelId> <link>");
      }

      const exist = await Channel.findOne({ channelId });
      if (exist) {
        return ctx.reply(
          `⚠️ Bu kanal allaqachon mavjud:\nID: ${exist.channelId}\nLink: ${exist.link}`
        );
      }

      await Channel.create({ channelId, adminId, link });
      ctx.reply(`✅ Kanal saqlandi:\nID: ${channelId}\nLink: ${link}`);
    } catch (error) {
      console.log("❌ Kanal yaratishda xatolik:", error);
      ctx.reply("❌ Kanal qo‘shishda xatolik yuz berdi.");
    }
  }

  // 📋 Barcha kanallarni olish
  async getAll(ctx) {
    try {
      const channels = await Channel.find();
      if (!channels.length) {
        return ctx.reply("ℹ️ Hali kanal qo‘shilmagan.");
      }

      let text = "📋 Kanallar ro‘yxati:\n\n";
      channels.forEach((ch, i) => {
        text += `${i + 1}. ID: ${ch.channelId}\n   🔗 Link: ${ch.link}\n\n`;
      });

      ctx.reply(text);
    } catch (error) {
      console.log("❌ Kanallarni olishda xatolik:", error);
      ctx.reply("❌ Kanallarni olishda muammo yuz berdi.");
    }
  }

  // 🔍 Bitta kanalni olish
  async get(ctx) {
    try {
      const id = ctx.message.text.split(" ")[2];
      if (!id) return ctx.reply("⚠️ Format: /channel get <channelId>");

      const channel = await Channel.findOne({ channelId: id });
      if (!channel) {
        return ctx.reply(`❌ ${id} bo‘yicha kanal topilmadi.`);
      }

      ctx.reply(`📡 Kanal:\nID: ${channel.channelId}\nLink: ${channel.link}`);
    } catch (error) {
      console.log("❌ Kanalni olishda xatolik:", error);
      ctx.reply("❌ Kanalni olishda muammo yuz berdi.");
    }
  }

  // ✏️ Kanalni yangilash
  async update(ctx) {
    try {
      const parts = ctx.message.text.split(" ");
      const id = parts[2];
      const newLink = parts[3];

      if (!id || !newLink) {
        return ctx.reply("⚠️ Format: /channel update <channelId> <newLink>");
      }

      const channel = await Channel.findOneAndUpdate(
        { channelId: id },
        { link: newLink },
        { new: true }
      );

      if (!channel) return ctx.reply("❌ Kanal topilmadi.");

      ctx.reply(
        `✅ Kanal yangilandi:\nID: ${channel.channelId}\nYangi link: ${channel.link}`
      );
    } catch (error) {
      console.log("❌ Kanalni yangilashda xatolik:", error);
      ctx.reply("❌ Kanalni yangilashda muammo yuz berdi.");
    }
  }

  // 🗑️ Kanalni o‘chirish
  async delete(ctx) {
    try {
      const id = ctx.message.text.split(" ")[2];
      if (!id) return ctx.reply("⚠️ Format: /channel delete <channelId>");

      const result = await Channel.findOneAndDelete({ channelId: id });
      if (!result) return ctx.reply("❌ Kanal topilmadi.");

      ctx.reply(
        `🗑️ Kanal o‘chirildi:\nID: ${result.channelId}\nLink: ${result.link}`
      );
    } catch (error) {
      console.log("❌ Kanalni o‘chirishda xatolik:", error);
      ctx.reply("❌ Kanalni o‘chirishda muammo yuz berdi.");
    }
  }
  //   async link(ctx) {
  //     try {
  //       const link = ctx.message.text.split(" ")[1];

  //       if (!link) {
  //         return ctx.reply("⚠️ Format: /channel link <kanal_link>");
  //       }

  //       // linkni tozalash (https://t.me/ bo‘lsa olib tashlaymiz)
  //       const username = link
  //         .replace("https://t.me/", "")
  //         .replace("@", "")
  //         .trim();

  //       // Telegram API orqali kanal haqida info olish
  //       const chat = await ctx.api.getChat(username);

  //       ctx.reply(`📡 Kanal ma’lumotlari:\n🆔 ID: ${chat.id}\n🔗 Link: ${link}`);
  //     } catch (error) {
  //       console.error("❌ Kanal ID topishda xatolik:", error);
  //       ctx.reply(
  //         "❌ Kanal linkidan ID topib bo‘lmadi. Ehtimol bot kanalga qo‘shilmagan."
  //       );
  //     }
  //   }

  // 📡 Asosiy /channel komandasi
  async channel(ctx) {
    try {
      const action = ctx.message.text.split(" ")[1];

      switch (action) {
        case "add":
          await this.create(ctx);
          break;
        case "getAll":
          await this.getAll(ctx);
          break;
        case "get":
          await this.get(ctx);
          break;
        case "update":
          await this.update(ctx);
          break;
        case "delete":
          await this.delete(ctx);
          break;
        // case "link":
        //   await this.link(ctx);
        //   break;
        default:
          ctx.reply(
            "⚠️ Mavjud amallar:\n/channel add <id> <link>\n/channel getAll\n/channel get <id>\n/channel update <id> <newLink>\n/channel delete <id>"
          );
      }
    } catch (error) {
      ctx.reply("❌ /channel komandasi ishlashida xatolik.");
      console.log("Channel error:", error);
    }
  }
}
