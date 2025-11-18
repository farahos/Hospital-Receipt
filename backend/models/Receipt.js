// models/Receipt.js
import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true  },
  service: { type: String, required: true },
  amount: { type: Number, required: true },

  receiptNumber: { type: Number, required: true }, // daily reset
  refNo: { type: String, required: true, unique: true },

  date: { type: Date, default: Date.now }
});

export default mongoose.model("Receipt", receiptSchema);