import { connect } from "mongoose";
import { config } from "dotenv";
config()
export const connectDB =async()=>{
try {
    await connect(process.env.MONGODB_URI);
    console.log('Database bilan ulanish muoffaqiyatli buldi ✅');
    
} catch (error) {
    console.log("Database biln bog'lanishda xatolik: ",error);
    
}
}
