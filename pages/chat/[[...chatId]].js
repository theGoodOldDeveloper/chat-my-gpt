import ChatSidebar from "components/ChatSidebar/ChatSidebar";
import Head from "next/head";
import { streamReader } from "openai-edge-stream";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Message } from "components/Message";
import Image from "next/image";
import React from "react";
import styles from "./myStyles.module.css";

export default function ChatPage() {
  const [incomingMessages, setIncomingMessages] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
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
    /* console.log("messageText: ", messageText.content); */
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
      /* console.log("MESSAGE: ", message); */
      setIncomingMessages((prev) => `${prev}${message.content}`);
      /* setIncomingMessages((prev) => [...prev, message.content]); */
    });
    setGeneratingResponse(false);
  };
  return (
    <div className={styles.container} z-40>
      <Head>
        <title>New chat 😊</title>
      </Head>
      <div className="z-10 grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar />
        <div className="z-20 flex flex-col overflow-hidden  bg-red-400">
          <div className=" z-30 flex-1 overflow-y-scroll">
            {newChatMessages.map((message) => (
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
