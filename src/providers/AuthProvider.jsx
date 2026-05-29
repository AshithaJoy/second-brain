import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import Splash from "../pages/Splash";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default function AuthProvider({ children }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  
  const [view, setView] = useState("login"); // login | register
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    restoreSession().finally(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 700 - elapsed);
      setTimeout(() => {
        setShowSplash(false);
      }, remaining);
    });
  }, [restoreSession]);

  if (showSplash || !initialized) {
    return <Splash />;
  }

  if (!token || !user) {
    if (view === "register") {
      return <Register onSwitchToLogin={() => setView("login")} />;
    }
    return <Login onSwitchToRegister={() => setView("register")} />;
  }

  return children;
}
