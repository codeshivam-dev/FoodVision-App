import { createContext, useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/FirebasConfig";

export const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserContext.Provider");
  }
  return context;
};

export const logoutUser = async (setUser) => {
  try {
    await signOut(auth);
    setUser(null);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
};

export default UserContext;