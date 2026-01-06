import { useState } from "react";
import PresetSelector from "./PresetSelector";
import DensitySelector from "./DensitySelector";
import StatsPanel from "./StatsPanel";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("crowd");

  const tabIcons = {
    crowd: (
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
    density: (
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
    stats: (
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
  };

  const tabs = [
    { id: "crowd", label: "Crowd" },
    { id: "density", label: "Density" },
    { id: "stats", label: "Stats" },
  ];

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-slate-900/50 rounded-xl mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg 
                      text-sm font-medium transition-all
                      ${
                        activeTab === tab.id
                          ? "bg-teal-600/20 text-teal-400 border border-teal-500/30"
                          : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                      }`}
          >
            {tabIcons[tab.id]}
            <span className="hidden xl:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === "crowd" && <PresetSelector />}
        {activeTab === "density" && <DensitySelector />}
        {activeTab === "stats" && <StatsPanel />}
      </div>
    </div>
  );
};

export default Sidebar;
