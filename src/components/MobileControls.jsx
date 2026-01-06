import { useState } from "react";
import PresetSelector from "./PresetSelector";
import DensitySelector from "./DensitySelector";
import StatsPanel from "./StatsPanel";
import MobileStatsBar from "./MobileStatsBar";

const MobileControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("crowd");

  return (
    <>
      {/* Collapsed bar - fixed positioning with safe area */}
      <div
        className="lg:hidden fixed left-4 right-4 z-20"
        style={{
          bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <MobileStatsBar />

        {/* Expand button */}
        <button
          onClick={() => setIsOpen(true)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full
                   bg-slate-800 border border-slate-700 text-xs text-slate-300
                   hover:bg-slate-700 transition-all shadow-lg"
        >
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            Configure
          </span>
        </button>
      </div>

      {/* Expanded panel */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel - fixed height that works with browser chrome */}
          <div
            className="absolute bottom-0 left-0 right-0 glass-dark rounded-t-3xl 
                        overflow-hidden animate-in"
            style={{
              animationName: "slideUp",
              height: "auto",
              maxHeight: "70%",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-800">
              <h2 className="text-lg font-display font-bold text-white">
                Configure
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-3 border-b border-slate-800">
              {[
                {
                  id: "crowd",
                  label: "Crowd",
                  icon: (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ),
                },
                {
                  id: "density",
                  label: "Density",
                  icon: (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                      />
                    </svg>
                  ),
                },
                {
                  id: "stats",
                  label: "Stats",
                  icon: (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  ),
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl 
                            text-sm font-medium transition-all
                            ${
                              activePanel === tab.id
                                ? "bg-teal-600/20 text-teal-400 border border-teal-500/30"
                                : "text-slate-400 hover:bg-slate-800"
                            }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "50vh" }}>
              {activePanel === "crowd" && <PresetSelector />}
              {activePanel === "density" && <DensitySelector />}
              {activePanel === "stats" && <StatsPanel />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileControls;
