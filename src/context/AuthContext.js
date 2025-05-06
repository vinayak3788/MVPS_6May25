//src/context/AuthContext.js

import { createContext, useState, useEffect, useContext } from "react";
import { useCart } from "./CartContext"; // Assuming CartContext is implemented

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const { clearCart } = useCart(); // Clear cart when logged in
  const [user, setUser] = useState(null);

  useEffect(() => {
    // If user logs in, clear the cart
    if (user) {
      clearCart();
    }
  }, [user, clearCart]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
