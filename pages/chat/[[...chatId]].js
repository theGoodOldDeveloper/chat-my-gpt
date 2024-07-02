import { getSession } from "@auth0/nextjs-auth0";
import ChatSidebar from "components/ChatSidebar/ChatSidebar";
import Head from "next/head";
import { streamReader } from "openai-edge-stream";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Message } from "components/Message";
import Image from "next/image";
import React from "react";
import styles from "./myStyles.module.css";
/* import { useRouter } from "next/router"; */
import Router from "next/router";
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";

export default function ChatPage({ chatId, title, messages = [] }) {
  console.log("props: ", title, messages);
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessages, setIncomingMessages] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  /* const router = useRouter; */
  const router = Router;

  useEffect(() => {
    setNewChatMessages([]);
    setNewChatId(null);
  }, [chatId]);

  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);
    setNewChatMessages((prev) => {
      const newChatMessages = [
        ...prev,
        {
          _id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
      return newChatMessages;
    });
    setMessageText("");
    //INFO: comment 1
    //console.log("NEW CHAT: ", json);
    //NOTE: const response move

    //INFO: comment 2
    const response = await fetch("/api/chat/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageText,
      }),
    });
    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    await streamReader(reader, (message) => {
      console.log("MESSAGE: ", message);
      if (message.event === "NewChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessages((prev) => `${prev}${message.content}`);
      }
      /* setIncomingMessages((prev) => `${prev}${message.content}`); */
      /* setIncomingMessages((prev) => [...prev, message.content]); */
    });

    setIncomingMessages("");
    setGeneratingResponse(false);
  };

  const allMessages = [...messages, ...newChatMessages];

  return (
    <div className={styles.container}>
      <Head>
        <title>New chat 😊</title>
      </Head>
      <div className="z-10 grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} />
        <div className="z-20 flex flex-col overflow-hidden  bg-red-400">
          <div className=" z-30 flex-1 overflow-y-scroll">
            {allMessages.map((message) => (
              <Message
                key={message._id}
                role={message.role}
                content={message.content}
              />
              /* { <Message key={message._id} {...message} /> } */
            ))}
            {!!incomingMessages && (
              <Message role="assistant" content={incomingMessages} />
            )}
            <div className="`${styles.backgroundImage}` z-0 flex items-center justify-center">
              <Image
                src="/background-image.png"
                width={450}
                height={450}
                alt="background"
                className="  opacity-50"
              />
            </div>
          </div>
          <footer className="  bg-red-500 p-7">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="focus:emerald-500 focus: w-full resize-none rounded-md bg-slate-700 p-2 text-white hover:bg-slate-600"
                  placeholder={
                    generatingResponse
                      ? " I'm working... 😎 "
                      : "Send a message: Hello, how are you? 😊 "
                  }
                />
                <button
                  className="btnSendMessage"
                  type="submit"
                  disabled={generatingResponse}
                >
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  const chatId = ctx.params?.chatId?.[0] || null;
  if (chatId) {
    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("ChatGPeter");
    const chat = await db.collection("chats").findOne({
      userId: user.sub,
      _id: new ObjectId(chatId),
    });
    return {
      props: {
        chatId,
        title: chat?.title || "Untitled",
        messages: chat?.messages.map((message) => ({
          ...message,
          _id: uuid(),
        })),
      },
    };
  }

  return {
    props: {},
  };
};

//INFO: comment 1
/* console.log("messageText: ", messageText.content); */
/* 
const response = await fetch("/api/chat/createNewChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageText,
      }),
    });
    const json = await response.json();
*/

//INFO: comment 2
/*     
    const response = await fetch("/api/chat/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageText,
      }),
    });
    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    await streamReader(reader, (message) => {
      console.log("MESSAGE: ", message); 
      setIncomingMessages((prev) => `${prev}${message.content}`);
      setIncomingMessages((prev) => [...prev, message.content]); 
    });
 */

/* import Router from "next/router"; */
/* const router = Router; */
