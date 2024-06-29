import { headers } from "next.config";
import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { message } = await req.json();
    console.log("MESSAGE: ", message);
    const initialChatMessages = {
      role: "system",
      content:
        "Your name is Chat.G.Peter 😈 theGoodOldDeveloper's assistant💕. Very intelligent and I am a helpful AI assistant. How can I help you today?",
    };
    const stream = await OpenAIEdgeStream(
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [initialChatMessages, { content: message, role: "user" }],
          stream: true,
        }),
      }
    );
    return new Response(stream);
  } catch (error) {
    console.log("ERROR MESSAGE: ", error);
  }
}
