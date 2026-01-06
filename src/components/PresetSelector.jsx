import { useState, useMemo } from "react";
import useStore from "../store/useStore";
import {
  CROWD_PRESETS,
  PRESET_CATEGORIES,
  formatNumber,
} from "../data/presets";
import PresetIcon from "./PresetIcon";

const PresetSelector = () => {
  const {
    selectedPreset,
    setSelectedPreset,
    customPopulation,
    setCustomPopulation,
  } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter presets based on category and search
  const filteredPresets = useMemo(() => {
    return CROWD_PRESETS.filter((preset) => {
      const matchesCategory =
        selectedCategory === "all" || preset.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.shock.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset);
    setCustomPopulation(null);
    setShowCustom(false);
    setIsExpanded(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const value = parseInt(customInput.replace(/,/g, ""), 10);
    if (!isNaN(value) && value > 0) {
      setCustomPopulation(value);
      setIsExpanded(false);
    }
  };

  const currentLabel = customPopulation
    ? `Custom: ${formatNumber(customPopulation)}`
    : selectedPreset.name;

  return (
    <div className="card max-w-sm w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Crowd Size
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {CROWD_PRESETS.length} presets
          </span>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            {showCustom ? "Use Preset" : "Custom"}
          </button>
        </div>
      </div>

      {showCustom ? (
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter population..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl 
                     text-white placeholder-slate-500 focus:outline-none focus:border-teal-500
                     focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
          <button type="submit" className="w-full btn-primary text-sm py-2">
            Apply
          </button>
        </form>
      ) : (
        <>
          {/* Selected preset display */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 bg-slate-800/50 
                     rounded-xl hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center text-teal-400">
                <PresetIcon name={selectedPreset.icon} size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">{currentLabel}</div>
                <div className="text-sm text-slate-400">
                  {formatNumber(customPopulation || selectedPreset.population)}{" "}
                  people
                </div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown list */}
          {isExpanded && (
            <div className="mt-3 space-y-3">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search presets..."
                  className="w-full px-3 py-2 pl-9 bg-slate-800 border border-slate-700 rounded-lg 
                           text-white text-sm placeholder-slate-500 focus:outline-none 
                           focus:border-teal-500 transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all
                            ${
                              selectedCategory === "all"
                                ? "bg-teal-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                >
                  All
                </button>
                {PRESET_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-all
                              ${
                                selectedCategory === cat.id
                                  ? "bg-teal-600 text-white"
                                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                              }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Results count */}
              <div className="text-xs text-slate-500">
                {filteredPresets.length} result
                {filteredPresets.length !== 1 ? "s" : ""}
              </div>

              {/* Presets list */}
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all
                              ${
                                selectedPreset.id === preset.id
                                  ? "bg-teal-600/20 border border-teal-500/50"
                                  : "bg-slate-800/30 hover:bg-slate-800/60 border border-transparent"
                              }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-teal-400 flex-shrink-0">
                      <PresetIcon name={preset.icon} size={16} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {preset.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatNumber(preset.population)}
                      </div>
                    </div>
                    {selectedPreset.id === preset.id && (
                      <svg
                        className="w-5 h-5 text-teal-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
                {filteredPresets.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    No presets found. Try a different search.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Shock quote */}
      {selectedPreset.shock && !showCustom && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <p className="text-sm text-slate-400 italic">
            "{selectedPreset.shock}"
          </p>
        </div>
      )}
    </div>
  );
};

export default PresetSelector;
