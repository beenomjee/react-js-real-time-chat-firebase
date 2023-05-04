import { signInWithPopup } from "firebase/auth";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  documentId,
  or,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./config";

export const googleLogin = async () => {
  const respone = await signInWithPopup(auth, googleProvider);
  const user = respone.user.providerData[0];
  const userRef = doc(db, "users", auth.currentUser.uid);
  await setDoc(userRef, {
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  });
};

export const getUsersWithEmail = async (email) => {
  const userRef = collection(db, "users");
  const q = query(userRef, where("email", ">=", email));
  const response = await getDocs(q);
  let users = response.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
  users = users.filter((user) => user.id !== auth.currentUser.uid);
  return users;
};

export const getUsersByIds = async (idArray) => {
  if (idArray.length === 0) return [];
  const userRef = collection(db, "users");
  idArray = idArray.filter((id) => id !== auth.currentUser.uid);
  let qArr = idArray.map((id) => where(documentId(), "==", id));
  const q = query(userRef, or(...qArr));
  let users = await getDocs(q);
  users = users.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
  let newUser = [];
  idArray.forEach((id) => {
    newUser.push(users.find((user) => user.id === id));
  });
  return newUser;
};
