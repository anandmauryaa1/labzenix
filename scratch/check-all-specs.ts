import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI as string;
mongoose.connect(uri).then(async () => {
  const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({}, { strict: false }));
  const prods = await Product.find();
  for (const p of prods) {
    console.log(`Product: ${p.title} | Specs:`, p.specs);
  }
  mongoose.disconnect();
});
