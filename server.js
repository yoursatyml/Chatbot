const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo error:", err));

// Chat schema: ab room + deleted flag bhi hai
const chatSchema = new mongoose.Schema({
  name: String,
  message: String,
  room: String,
  time: { type: Number, default: Date.now },
  deleted: { type: Boolean, default: false },
});

const Chat = mongoose.model("Chat", chatSchema);

// Send message
app.post("/send", async (req, res) => {
  try {
    const { name, message, room } = req.body;

    if (!name || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Name and message required" });
    }

    const roomId = room || "default-room";

    await Chat.create({
      name,
      message,
      room: roomId,
      time: Date.now(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ success: false });
  }
});

// Get messages (sirf ek room ke, aur jo delete nahi hue)
app.get("/messages", async (req, res) => {
  try {
    const roomId = req.query.room || "default-room";

    const msgs = await Chat.find({
      room: roomId,
      deleted: false,
    }).sort({ time: 1 });

    res.json(msgs);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false });
  }
});

// Apne message delete karna (sirf jisne bheja wahi delete kar sakta hai)
app.post("/delete", async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res
        .status(400)
        .json({ success: false, error: "id and name required" });
    }

    const result = await Chat.updateOne(
      { _id: id, name },
      { $set: { deleted: true } }
    );

    if (result.modifiedCount === 0) {
      return res.json({
        success: false,
        error: "Message not found or not yours",
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
