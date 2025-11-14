import { AdminController } from "../admin/controller.admin.js";
const controller = new AdminController();

const router = async (ctx) => {
  try {
    if (ctx.message.video) {
      // 🎥 Video yuborilganda
      await controller.video(ctx);
      return;
    }

    if (ctx.message.text) {
      const mess = ctx.message.text.split(" ")[0];

      if (ctx.message.text === "/start") {
        await controller.start(ctx);
      } else if (mess === "/channel") {
        await controller.channel(ctx);
      }else if(mess ==="/users"){
        controller.users(ctx)
      }
       else {
        await controller.message(ctx);
      }

      return;
    }

    // agar text ham, video ham bo‘lmasa
    // await ctx.reply("⚠️ Faqat matn yoki video yuboring.");
  } catch (error) {
    console.log("Routerdan error", error);
    ctx.reply("❌ Routerda xatolik yuz berdi.");
  }
};

export default router;
