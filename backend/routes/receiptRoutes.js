// routes/receiptRoutes.js
import express from "express";
import Receipt from "../models/Receipt.js";

const router = express.Router();

// Create new receipt
router.post("/", async (req, res) => {
  try {
    const { fullName, phone, service, amount } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate daily receiptNumber
    const lastToday = await Receipt.findOne({
      date: { $gte: today }
    }).sort({ receiptNumber: -1 });

    let receiptNumber = lastToday ? lastToday.receiptNumber + 1 : 1;

    // Generate refNo
    const lastRef = await Receipt.findOne().sort({ _id: -1 });

    let globalNumber = lastRef ? parseInt(lastRef.refNo.split("/")[1]) + 1 : 1;

    const year = new Date().getFullYear();
    
    // FIXED
    const refNo = `far/${String(globalNumber).padStart(3, "0")}/${year}`;

    // Save receipt
    const receipt = await Receipt.create({
      fullName,
      phone,
      service,
      amount,
      receiptNumber,
      refNo
    });

    res.json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Search ama get all with filter
router.get("/", async (req, res) => {
  try {
    const { phone, search } = req.query;
    let query = {};

    // If phone parameter exists, search by phone
    if (phone) {
      query.phone = { $regex: phone, $options: "i" };
    }

    // If general search parameter exists
    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } }
      ];
    }

    const receipts = await Receipt.find(query)
      .select("phone fullName")
      .limit(10)
      .sort({ createdAt: -1 });

    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 GET ALL Receipts (Full Data)
// ================================
router.get("/all", async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;
