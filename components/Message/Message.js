import { useUser } from "@auth0/nextjs-auth0/client";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

export const Message = ({ role, content }) => {
  const { user } = useUser();
  console.log("USER: ", user.picture);
  return (
    <div
      className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${
        role === "assistant"
          ? "bg-gay-600"
          : role === "notice"
          ? "bg-red-600"
          : ""
      }`}
    >
      <div>
        {role === "user" && !!user && (
          <Image
            src={user.picture}
            width={30}
            height={30}
            alt="user avatar"
            className="rounded-sm shadow-md shadow-black/50"
          />
        )}
        {role === "assistant" && (
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-sm bg-gray-800 shadow-md shadow-black/50">
            <FontAwesomeIcon icon={faRobot} className="text-emerald-200" />
          </div>
        )}
      </div>
      <div>{content}</div>
    </div>
  );
};
