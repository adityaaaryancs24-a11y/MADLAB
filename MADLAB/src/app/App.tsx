import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#0A0E15]">
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </div>
    </AppProvider>
  );
}