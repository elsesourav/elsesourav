import { useState, useEffect } from "react";

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      let id = localStorage.getItem("x-session-id");
      if (!id) {
        id = generateId();
        localStorage.setItem("x-session-id", id);
      }
      setSessionId(id);
    } catch (error) {
      console.error("Failed to generate or read session ID", error);
      // Fallback for strict privacy modes
      setSessionId(generateId());
    }
  }, []);

  return sessionId;
}
