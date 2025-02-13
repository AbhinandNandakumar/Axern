const express = require('express');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const admin = require('firebase-admin');
require("dotenv").config();
const PORT = process.env.PORT || 5001;
const cors = require('cors');


// Initialize Firebase Admin
const serviceAccount = require('./axern-ai-firebase-adminsdk-fbsvc-79d3569a20.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware to parse JSON bodies (if needed)
const db = admin.firestore();
app.use(express.json());
app.use(cors());


const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

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
app.post("/api/chat", authenticateToken, async (req, res) => {
  try {
    const { userInput } = req.body;
    if (!userInput) return res.status(400).json({ error: "Input required" });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const chatSession = model.startChat({ generationConfig });
    const result = await chatSession.sendMessageStream(userInput);

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write(chunkText);
    }

    // Save chat after completion
    await saveChatToFirebase(req.user.uid, userInput, fullResponse);
    
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Chat history endpoint
app.get("/api/chat-history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const chatsRef = db.collection('users').doc(userId).collection('chats');
    const snapshot = await chatsRef.orderBy('timestamp', 'desc').get();

    const chatHistory = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      chatHistory.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()
      });
    });

    res.json(chatHistory);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chat history" });
  }
});

// Delete chat endpoint
app.delete("/api/chat/:chatId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const chatId = req.params.chatId;
    
    await db.collection('users')
      .doc(userId)
      .collection('chats')
      .doc(chatId)
      .delete();

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting chat" });
  }
});

// Helper function to save chat
async function saveChatToFirebase(userId, input, response) {
  const chatRef = db.collection('users').doc(userId).collection('chats').doc();
  await chatRef.set({
    input,
    response,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    userId
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
