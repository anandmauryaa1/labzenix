import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI as string;
mongoose.connect(uri).then(async () => {
  const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({}, { strict: false }));
  const prod = await Product.findOne();
  console.log("Specs:", prod?.specs, typeof prod?.specs);
  if (prod?.specs) console.log("Keys:", Object.keys(prod.specs));
  mongoose.disconnect();
});
