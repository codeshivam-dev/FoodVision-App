import { createContext, useContext } from "react";

export const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserContext.Provider");
  }
  return context;
};

export default UserContext;