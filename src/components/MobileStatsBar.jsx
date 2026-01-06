import useStore from "../store/useStore";
import { formatNumber, formatArea, calculateArea } from "../data/presets";
import PresetIcon from "./PresetIcon";

const MobileStatsBar = () => {
  const {
    selectedPreset,
    selectedDensity,
    customPopulation,
    setShowShareModal,
  } = useStore();

  const population = customPopulation || selectedPreset.population;
  const area = calculateArea(population, selectedDensity.areaPerPerson);
  const formattedArea = formatArea(area);

  return (
    <div className="glass rounded-2xl p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center text-teal-400">
          <PresetIcon name={selectedPreset.icon} size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {formatNumber(population)} people
          </div>
          <div className="text-xs text-slate-400">
            {formattedArea.metric} • {selectedDensity.name}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowShareModal(true)}
        className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 
                 text-white flex-shrink-0 shadow-lg shadow-teal-500/25"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>
    </div>
  );
};

export default MobileStatsBar;
