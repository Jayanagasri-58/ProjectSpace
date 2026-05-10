import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth } from '@/lib/authMiddleware';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: NextRequest) {
  const { error } = requireAuth(req);
  if (error) return error;

  try {
    // If no key is provided in env AND the fallback is the placeholder, show instruction
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return NextResponse.json({ 
        response: "⚠️ **API Key Missing!**\n\nTo make me truly smart, you need to add your free Google Gemini API Key. \n\n1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and click 'Create API Key'.\n2. Open the `.env.local` file in your project.\n3. Replace `YOUR_API_KEY_HERE` with your actual key.\n4. Restart the server and try asking me anything!" 
      });
    }

    const { message } = await req.json();
    
    // --- ADVANCED LOCAL SMART ENGINE (TOTAL AI FALLBACK) ---
    const localKnowledge: { [key: string]: string } = {
      "sick leave": "I can help you draft a sick leave letter:\n\n'To The HOD,\nI am writing to request sick leave for [Date] as I am suffering from [Ailment]. I will catch up on my studies as soon as I return.\n\nSincerely, [Your Name]'",
      "event permission": "For event permission, use this template:\n\n'Subject: Permission for [Event Name]\nDear Faculty, we are organizing [Event] on [Date] at [Venue]. We request your permission to proceed and use campus facilities.\n\nRegards, [Team Name]'",
      "attendance": "If your attendance is low, you should immediately speak with your Class Coordinator. Most departments require 75% attendance for exams.",
      "cgp": "CGPA is calculated by taking the weighted average of your grade points across all semesters. Do you need help with a specific calculation?",
      "internship": "For internships, check the 'Training & Placement' cell. You usually need a 'No Objection Certificate' (NOC) from your HOD first.",
      "variable": "In programming, a variable is a container for storing data values. Think of it like a labeled box where you can put information.",
      "function": "A function is a block of code designed to perform a particular task. You call it whenever you need that task done!",
      "react": "React is a JavaScript library for building user interfaces. It uses 'components' to make websites fast and modular.",
      "nextjs": "Next.js is a framework built on top of React that handles things like routing and server-side rendering automatically.",
      "time": "The campus is generally active from 8:30 AM to 5:00 PM. Specific lab timings may vary.",
      "food": "The campus cafeteria serves meals from 8:00 AM to 6:00 PM. There are also snack kiosks near the main block.",
      "hostel": "For hostel-related issues, please contact the Chief Warden's office in the Admin block."
    };

    const getAdvancedResponse = (msg: string) => {
      const lower = msg.toLowerCase();
      
      // Check for math
      if (lower.includes("+") || lower.includes("-") || lower.includes("*") || lower.includes("/")) {
        try {
          // Simple safe evaluation for basic math
          const mathMatch = msg.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
          if (mathMatch) {
            const [_, n1, op, n2] = mathMatch;
            const res = eval(`${n1}${op}${n2}`);
            return `I've calculated that for you: ${n1} ${op} ${n2} = **${res}**.`;
          }
        } catch(e) {}
      }

      // Check knowledge base
      for (const key in localKnowledge) {
        if (lower.includes(key)) return localKnowledge[key];
      }

      // Default smart response
      return "I'm currently operating in **Campus Mode**. I can help you with: \n• Drafting **Sick Leave** or **Event** letters\n• Explaining concepts like **Variables** or **React**\n• Campus info like **Attendance**, **Library**, or **Hostel**\n\nWhat would you like to know about?";
    };
    // -------------------------------------------------------

    // Provide a system prompt context
    const prompt = `You are the CampusConnect AI Assistant. You are a helpful AI tutor for college students. 
    Help with: academic doubts, concepts, and campus questions.
    Student's question: ${message}`;

    // We'll try with models/gemini-1.5-flash first, then models/gemini-pro
    let result;
    try {
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey.length < 10) throw new Error("Key missing");
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      result = await model.generateContent(prompt);
      
      const responseText = result.response.text();
      return NextResponse.json({ response: responseText });
    } catch (e: any) {
      console.log("Using Advanced Local Engine due to:", e.message);
      return NextResponse.json({ response: getAdvancedResponse(message) });
    }
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
