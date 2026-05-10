const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = "AIzaSyCxIISSHN8qd6SC2pwhHjocR0uGGzHa36I";
  console.log("Using API Key:", apiKey.substring(0, 8) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-1.5-flash!");
  } catch (e) {
    console.error("Error with gemini-1.5-flash:", e.message);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-pro!");
    } catch (e2) {
        console.error("Error with gemini-pro:", e2.message);
    }
  }
}

listModels();
