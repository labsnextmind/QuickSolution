import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(express.json());
app.use(cors());
app.use(express.static("."));

const apis = [
  "https://api.monkedev.com/fun/chat",
  "https://api.affiliateplus.xyz/api/chatbot",
  "https://api.quotable.io/random"
];

const OCR_API = "https://api.ocr.space/parse/image";

app.post("/api/ocr", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const form = new FormData();
    form.append("apikey", "helloworld");
    form.append("file", fs.createReadStream(imagePath));

    const response = await fetch(OCR_API, { method: "POST", body: form });
    const result = await response.json();

    fs.unlinkSync(imagePath);
    const extractedText = result?.ParsedResults?.[0]?.ParsedText || "";
    res.json({ text: extractedText.trim() });
  } catch (err) {
    res.status(500).json({ error: "OCR failed" });
  }
});

app.post("/api/getAnswer", async (req, res) => {
  const { question } = req.body;
  let responseText = "";

  for (let api of apis) {
    try {
      const url =
        api.includes("chatbot") || api.includes("monkedev")
          ? `${api}?message=${encodeURIComponent(question)}`
          : api;
      const response = await fetch(url);
      const data = await response.json();
      if (data.response || data.reply || data.content) {
        responseText = data.response || data.reply || data.content;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!responseText) responseText = "No valid response received.";
  res.json({ answer: responseText });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));