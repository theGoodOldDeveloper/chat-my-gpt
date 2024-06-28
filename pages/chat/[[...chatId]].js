import ChatSidebar from "components/ChatSidebar/ChatSidebar";
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [messageText, setMessageText] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("messageText: ", messageText);
  };
  return (
    <>
      <Head>
        <title>New chat 😊</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar />
        <div className="flex flex-col bg-red-400">
          <div className="flex-1 ">chat window</div>
          <footer className="  bg-red-500 p-7">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="focus:emerald-500 focus: w-full resize-none rounded-md bg-slate-700 p-2 text-white hover:bg-slate-600"
                  placeholder=" Send a message: Hello, how are you? 😊"
                />
                <button className="btnSendMessage" type="submit">
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}
