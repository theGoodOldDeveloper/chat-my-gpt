import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    console.log("USER (getSession): ", user);
    const { message } = req.body;
    console.log("MESSAGE: ", message);

    // validate message data
    if (!message || typeof message !== "string" || message.length > 200) {
      res.status(422).json({ message: "Something went wrong... 😒" });
      return;
    }

    const newUserMessages = {
      role: "user",
      content: message,
    };
    console.log("NEW USER MESSAGES: ", newUserMessages);
    const client = await clientPromise;
    const db = client.db("ChatGPeter");
    const chat = await db.collection("chats").insertOne({
      userId: user.sub,
      messages: [newUserMessages],
      title: message,
    });
    console.log("CHAT: ", chat);
    res.status(200).json({
      _id: chat.insertedId.toString(),
      messages: [newUserMessages],
      title: message,
    });
    /* return { user }; */
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong... 😒 (create new message)" });
    console.log("ERROR: ", error);
  }
}
