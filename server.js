const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const chatSchema = new mongoose.Schema({
  name: String,
  message: String,
  time: Number
});

const Chat = mongoose.model("Chat", chatSchema);

app.post("/send", async (req,res)=>{
  const {name, message} = req.body;
  await Chat.create({name, message, time: Date.now()});
  res.json({success:true});
});

app.get("/messages", async (req,res)=>{
  const msgs = await Chat.find().sort({time:1});
  res.json(msgs);
});

app.listen(3000,()=>console.log("Server Running"));
