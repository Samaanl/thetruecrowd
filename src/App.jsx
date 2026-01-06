import { useEffect } from "react";
import Map from "./components/Map";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MobileControls from "./components/MobileControls";
import ShareModal from "./components/ShareModal";
import LoadingScreen from "./components/LoadingScreen";
import Toast from "./components/Toast";
import useStore from "./store/useStore";

function App() {
  const { isDark } = useStore();

  // Apply theme class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden ${
        isDark ? "bg-slate-950" : "bg-slate-100"
      }`}
    >
      {/* Loading screen */}
      <LoadingScreen />

      {/* Map background */}
      <div className="absolute inset-0 z-0">
        <Map />
      </div>

      {/* Header */}
      <Header />

      {/* Desktop sidebar */}
      <div className="hidden lg:block absolute top-20 left-4 bottom-4 w-80 xl:w-96 z-20 select-none">
        <Sidebar />
      </div>

      {/* Mobile controls */}
      <MobileControls />

      {/* Share modal */}
      <ShareModal />

      {/* Toasts */}
      <Toast />

      {/* Gradient overlays for depth */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/50 to-transparent z-[5]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/50 to-transparent z-[5] lg:hidden" />
    </div>
  );
}

export default App;
