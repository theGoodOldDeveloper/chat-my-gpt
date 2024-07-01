import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  console.log("REQ: ", req);
  try {
    const { message } = await req.json();
    console.log("MESSAGE: ", message);
    const initialChatMessages = {
      role: "system",
      content:
        "Your name is Chat.G.Peter 😈 theGoodOldDeveloper's assistant💕. Very intelligent and I am a helpful AI assistant. How can I help you today?",
    };
    //NOTE: insert const respone

    const response = await fetch(
      `${req.headers.get("origin")}/api/chat/createNewChat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie"),
        },
        body: JSON.stringify({
          message,
        }),
      }
    );
    const json = await response.json();
    const chatId = json._id;

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
      },
      {
        onBeforeStream: async ({ emit }) => {
          emit(chatId, "NewChatId");
        },
        //INFO: **************************************************************
        onAfterStream: async ({ fullContent }) => {
          await fetch(
            `${req.headers.get("origin")}/api/chat/addMessageToChat`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                cookie: req.headers.get("cookie"),
              },
              body: JSON.stringify({
                chatId,
                role: "assistant",
                content: fullContent,
              }),
            }
          );
        },
      }
    );
    return new Response(stream);
  } catch (error) {
    console.log("ERROR MESSAGE: ", error);
  }
}

//INFO; az emit-tel meg egy ucsoo uzenetet kuldhetunk a stream utaan
/* 
onAfterStream: async (emit, fullContent) => {
          console.log("FULL CONTEXT: ", fullContent); 
          console.log("EMIT: ", emit);
        }
*/
