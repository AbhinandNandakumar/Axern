const express = require('express');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5001;
const cors = require('cors');



// Optional: Load environment variables from a .env file
// require('dotenv').config();

// Middleware to parse JSON bodies (if needed)
app.use(express.json());
app.use(cors());

const systemInstruction = process.env.GEMINI_SYSTEM_INSTRUCTION;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);



const model = genAI.getGenerativeModel({
   model: "gemini-2.0-flash",
   systemInstruction,
 });
 
 const generationConfig = {
   temperature: 1,
   topP: 0.95,
   topK: 40,
   maxOutputTokens: 8192,
   responseMimeType: "text/plain",
 };

// A simple test endpoint
// Backend (server.js)
app.post("/api/chat", async (req, res) => {
  try {
    const { userInput } = req.body;
    if (!userInput) return res.status(400).json({ error: "Input required" });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const chatSession = model.startChat({ generationConfig });
    const result = await chatSession.sendMessageStream(userInput);
    
    for await (const chunk of result.stream) {
      res.write(chunk.text());
    }
    
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
