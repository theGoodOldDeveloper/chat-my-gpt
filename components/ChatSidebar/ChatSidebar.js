import {
  faMessage,
  faPlus,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
/* import styles from "./myStyles.module.css"; */
//console.log("styles: ", styles.iconSize);
export default function ChatSidebar({ chatId }) {
  const [chatList, setChatList] = useState([]);
  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch("/api/chat/getChatList", {
        method: "POST",
      });
      const json = await response.json();
      console.log("JSON: ", json);
      setChatList(json?.chats || []);
    };
    loadChatList();
  }, [chatId]);
  return (
    <div className="flex flex-col overflow-hidden bg-slate-700">
      <Link className="btnNewChat flex " href="/chat">
        <FontAwesomeIcon icon={faPlus} className="mr-2 p-1" /> New Chat
      </Link>
      <div className="  flex-1 overflow-auto text-yellow-100">
        {chatList.map((chat) => (
          <Link
            key={chat._id}
            href={`/chat/${chat._id}`}
            className={`flex rounded-md px-4 py-2 hover:bg-slate-600 ${
              chatId === chat._id ? "bg-slate-500" : ""
            }`}
          >
            <FontAwesomeIcon icon={faMessage} className=" mr-2 p-1 " />{" "}
            {chat.title}
          </Link>
        ))}
      </div>
      <Link className="btnLogout flex " href="/api/auth/logout">
        <FontAwesomeIcon icon={faRightToBracket} className="mr-2 p-1" /> Logout
      </Link>
    </div>
  );
}
