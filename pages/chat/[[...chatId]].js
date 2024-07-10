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
import { useRouter } from "next/router";
/* import Router from "next/router"; */
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDragon } from "@fortawesome/free-solid-svg-icons";
import { faHamburger } from "@fortawesome/free-solid-svg-icons";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { redirect } from "next/dist/server/api-utils";

export default function ChatPage({ chatId, title, messages = [] }) {
  console.log("props: ", title, messages);
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessages, setIncomingMessages] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [fullMessage, setFullMessage] = useState("");
  const [originalChatId, setOriginalChatId] = useState(chatId);
  const router = useRouter();
  /* const router = Router; */
  const [sidebarVisible, setSidebarVisible] = useState("hidden");
  const [hamburgerIcon, setHamburgerIcon] = useState(faHamburger); //&#88;

  const routeHasChanged = chatId !== originalChatId;

  useEffect(() => {
    setNewChatMessages([]);
    setNewChatId(null);
  }, [chatId]);

  useEffect(() => {
    if (!routeHasChanged && !generatingResponse && fullMessage) {
      setNewChatMessages((prev) => [
        ...prev,
        {
          _id: uuid(),
          role: "assistant",
          content: fullMessage,
        },
      ]);
      setFullMessage("");
    }
  }, [generatingResponse, fullMessage, routeHasChanged]);

  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);
    setOriginalChatId(chatId);
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
    //console.log("NEW CHAT: ", json);

    const response = await fetch("/api/chat/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId,
        message: messageText,
      }),
    });
    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    let content = "";
    await streamReader(reader, (message) => {
      console.log("MESSAGE:😈😁😈 ", message);
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessages((prev) => `${prev}${message.content}`);
        content = content + message.content;
      }
      /* setIncomingMessages((prev) => `${prev}${message.content}`); */
      /* setIncomingMessages((prev) => [...prev, message.content]); */
    });
    setFullMessage(content);
    setIncomingMessages("");
    setGeneratingResponse(false);
  };

  const allMessages = [...messages, ...newChatMessages];
  //BUG: <div className={styles.container}>
  return (
    <>
      <Head>
        <title>New chat 😊</title>
      </Head>

      <div className="flex h-screen md:grid md:grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} sidebarVisible={sidebarVisible} />

        <div className="z-20 w-full overflow-hidden bg-red-400 md:flex  md:flex-col">
          {/* //NOTE hamburger menu */}
          <div className="flex justify-end">
            <button
              id="mobile-open-button"
              class=" sm:hidden"
              onClick={() => {
                setSidebarVisible((prev) =>
                  prev === "hidden" ? "" : "hidden"
                );
                setHamburgerIcon((prev) =>
                  prev === faHamburger ? faX : faHamburger
                );
              }}
              /* class="text-3xl focus:outline-none sm:hidden" */
            >
              <FontAwesomeIcon
                icon={hamburgerIcon}
                className="p-2  text-4xl text-emerald-200"
              />
            </button>
          </div>
          {/* hamburger menu */}
          <div className="  z-30 flex h-3/4 flex-1 flex-col-reverse overflow-y-scroll">
            {!allMessages.length && !incomingMessages && (
              <div className="m-auto flex items-center justify-center text-center">
                <div>
                  <FontAwesomeIcon
                    icon={faDragon}
                    className="text-7xl text-emerald-200"
                  />
                  <h1 className="mt-2 text-4xl font-bold text-white/50">
                    You have a problem...
                  </h1>
                  <p className="mt-2 text-base italic  text-white/50">
                    by theGoodOldDeveloper
                  </p>
                  <div className="mt-4 flex  justify-center">
                    <Image
                      src="/favicon.png"
                      width={50}
                      height={50}
                      alt="background"
                      className=" rounded-full  opacity-80 "
                    />
                  </div>
                </div>
              </div>
            )}
            {!!allMessages.length && (
              <div className="mb-auto">
                {allMessages.map((message) => (
                  <Message
                    key={message._id}
                    role={message.role}
                    content={message.content}
                  />
                  /* { <Message key={message._id} {...message} /> } */
                ))}

                {!!incomingMessages && !routeHasChanged && (
                  <Message role="assistant" content={incomingMessages} />
                )}
                {!!incomingMessages && !!routeHasChanged && (
                  <Message
                    role="notice"
                    content="Only one message at a time. Please allow any other responses to complete before sending another message"
                  />
                )}
                {/* <div className="`${styles.backgroundImage}` z-0 flex items-center justify-center">
              <Image
                src="/background-image.png"
                width={450}
                height={450}
                alt="background"
                className="  opacity-50"
              />
            </div> */}
              </div>
            )}
          </div>
          <footer className="  bg-red-500 p-7">
            <form onSubmit={handleSubmit}>
              <fieldset className="gap-2 md:flex" disabled={generatingResponse}>
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
                <div className="m-auto flex  justify-center">
                  <button
                    className="btnSendMessage"
                    type="submit"
                    disabled={generatingResponse}
                  >
                    Send
                  </button>
                </div>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const chatId = ctx.params?.chatId?.[0] || null;
  if (chatId) {
    let objectId;

    try {
      objectId = new ObjectId(chatId);
    } catch (e) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }
    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("ChatGPeter");
    const chat = await db.collection("chats").findOne({
      userId: user.sub,
      _id: objectId,
    });

    if (!chat) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }

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
