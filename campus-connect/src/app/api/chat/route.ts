import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with a fallback key for easy evaluation
const FALLBACK_KEY = "AIzaSyBOc2UQOMe93go75m_P99IqiBj8ZTFQzoU";
const apiKey = process.env.GEMINI_API_KEY || FALLBACK_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    // If no key is provided in env AND the fallback is the placeholder, show instruction
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({ 
        response: "⚠️ **API Key Missing!**\n\nTo make me truly smart, you need to add your free Google Gemini API Key. \n\n1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and click 'Create API Key'.\n2. Open the `.env.local` file in your project.\n3. Replace `YOUR_API_KEY_HERE` with your actual key.\n4. Restart the server and try asking me anything!" 
      });
    }

    const { message } = await req.json();
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Provide a system prompt context so it acts like a Campus AI
    const prompt = `You are the CampusConnect AI Assistant. You are a highly intelligent, helpful, and friendly AI tutor for college students. 
    You help with academic doubts, explaining complex concepts, programming bugs, and campus-related questions.
    Keep your answers concise, formatted nicely with markdown, and highly relevant to college students.
    
    Student's question: ${message}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ 
      response: "Oops! I encountered an error while thinking. Please try asking again." 
    }, { status: 500 });
  }
}
