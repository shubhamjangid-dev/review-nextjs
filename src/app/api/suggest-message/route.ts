import { GoogleGenerativeAI } from "@google/generative-ai";
// import {} from "ai";

const geminiAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model = geminiAi.getGenerativeModel({ model: "gemini-pro" });

export async function POST(request: Response) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const { response } = await model.generateContent(prompt);

    return Response.json(
      {
        success: true,
        message: "Response generated successfully",
        suggestion: response.text(),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("ERROR :: error occured while generating text ::", error);
    return Response.json(
      {
        success: false,
        message: "Failed to generate text",
      },
      {
        status: 500,
      }
    );
  }
}
