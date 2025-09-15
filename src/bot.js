// imports
import { config } from "dotenv";
import { Bot } from "grammy";
import { connectDB } from "./db/mongo.connection.js";
import adminRouter from "./router/admin.router.js";
import userRouter from "./router/user.router.js";

// env sozlamalari
config();
const bot = new Bot(process.env.TOKEN);
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_ID = Number(process.env.ADMIN_ID); // faqat shu ID admin

// DB ga ulanamiz
await connectDB();

// routerlarni farqlash
bot.on("message", async (ctx) => {
  try {
    if (ctx.from.id === ADMIN_ID) {
      // 🔑 faqat admin uchun router
      await adminRouter(ctx);
    } else {
      // 👤 oddiy user uchun router
      await userRouter(ctx);
    }
  } catch (err) {
    console.error("❌ Router error:", err.message);
    ctx.reply("⚠️ Xatolik yuz berdi. Iltimos keyinroq urinib ko‘ring.");
  }
});


bot.start();
console.log(`🚀 Bot ishga tushdi. Port: ${PORT}`);
