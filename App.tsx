import React, { useEffect } from "react";
import RootNavigator from "./app/components/Navigation/RootNavigator";
import api from "./app/services/api"; // Import Axios instance

export default function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get("auth/test"); // Adjust route if needed
        console.log("✅ Backend Connected Successfully:", response.data);
      } catch (error) {
        console.error("❌ Backend Connection Failed:", error);
      }
    };

    testConnection();
  }, []);

  return (
    <RootNavigator />
  );
}
