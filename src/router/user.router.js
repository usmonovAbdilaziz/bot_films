import { UserContoller } from "../user/controller.user.js";
import { AuthGuard } from "../guard/auth.guard.js";

const controller = new UserContoller();

const router = async (ctx) => {
  try {
    if (ctx.message.text === "/start") {
      // /start uchun guard ishlamaydi
      await controller.start(ctx);
    } else {
      // boshqa barcha xabarlar uchun avval guard ishlaydi
      await AuthGuard(ctx, async () => {
        await controller.message(ctx);
      });
    }
  } catch (err) {
    console.error("❌ User router error:", err.message);
    ctx.reply("⚠️ Xatolik yuz berdi. Keyinroq urinib ko‘ring.");
  }
};

export default router;
