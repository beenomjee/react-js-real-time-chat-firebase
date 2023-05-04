import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export const sendMessage = async (message, receiverId) => {
  const roomRef = collection(db, "messages");
  await addDoc(roomRef, {
    createdAt: serverTimestamp(),
    message,
    senderId: auth.currentUser.uid,
    receiverId,
  });
};
