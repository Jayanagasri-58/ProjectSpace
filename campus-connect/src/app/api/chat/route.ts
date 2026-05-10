import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    // If no key is provided in env AND the fallback is the placeholder, show instruction
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({ 
        response: "⚠️ **API Key Missing!**\n\nTo make me truly smart, you need to add your free Google Gemini API Key. \n\n1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and click 'Create API Key'.\n2. Open the `.env.local` file in your project.\n3. Replace `YOUR_API_KEY_HERE` with your actual key.\n4. Restart the server and try asking me anything!" 
      });
    }

    const { message } = await req.json();
    
    // Provide a system prompt context
    const prompt = `You are the CampusConnect AI Assistant. You are a helpful AI tutor for college students. 
    Help with: academic doubts, concepts, and campus questions.
    Student's question: ${message}`;

    // We'll try with models/gemini-1.5-flash first, then models/gemini-pro
    let result;
    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      result = await model.generateContent(prompt);
    } catch (e: any) {
      console.log("Falling back to gemini-pro due to:", e.message);
      const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
      result = await model.generateContent(prompt);
    }
    
    if (!result || !result.response) {
      throw new Error("No response from Gemini API");
    }

    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('AI Assistant Error:', error.message || error);
    
    // If it's a 403, it's likely an invalid key or restricted access
    if (error.message?.includes('403') || error.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json({ 
        response: "🔑 **API Key Error:** Your key seems invalid or is still activating. Please double-check it on Vercel and wait 2 minutes." 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      response: "Oops! I encountered an error while thinking. This usually happens if the GEMINI_API_KEY is missing on Vercel, invalid, or still activating. \n\n**Action required:** Please go to Vercel Settings > Environment Variables and ensure `GEMINI_API_KEY` is set to your latest key from Google AI Studio." 
    }, { status: 500 });
  }
}
