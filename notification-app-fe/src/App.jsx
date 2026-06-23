import { useEffect } from "react";
import mylog from "./utils/logger";
import { NotificationsPage } from "./pages/NotificationsPage";

export default function App() {
  useEffect(() => {
    mylog(
      "frontend",
      "info",
      "component",
      "Application loaded"
    );
  }, []);

  return <NotificationsPage />;
}