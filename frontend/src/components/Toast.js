import React, { useEffect } from "react";

function Toast({ message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 30,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#222",
        color: "#fff",
        padding: "1rem 2rem",
        borderRadius: 8,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        fontSize: "1.1rem",
        opacity: 0.95,
      }}
    >
      {message}
    </div>
  );
}

export default Toast;
