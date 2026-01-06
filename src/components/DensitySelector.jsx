import useStore from "../store/useStore";
import { DENSITY_MODES } from "../data/presets";
import PresetIcon from "./PresetIcon";

const DensitySelector = () => {
  const { selectedDensity, setSelectedDensity } = useStore();

  return (
    <div className="card max-w-sm w-full">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Density Mode
      </h3>

      <div className="space-y-2">
        {DENSITY_MODES.map((density) => (
          <button
            key={density.id}
            onClick={() => setSelectedDensity(density)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all
                      ${
                        selectedDensity.id === density.id
                          ? "ring-2 ring-offset-2 ring-offset-slate-900"
                          : "hover:bg-slate-800/60"
                      }`}
            style={{
              backgroundColor:
                selectedDensity.id === density.id
                  ? `${density.color}20`
                  : "transparent",
              borderColor: density.color,
              ringColor: density.color,
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${density.color}30`,
                color: density.color,
              }}
            >
              <PresetIcon name={density.icon} size={20} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-white">{density.name}</div>
              <div className="text-xs text-slate-400">
                {density.areaPerPerson} m² per person
              </div>
            </div>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: density.color }}
            />
          </button>
        ))}
      </div>

      {/* Selected density info */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Feeling:</span>
          <span
            className="font-medium px-2 py-1 rounded-lg"
            style={{
              backgroundColor: `${selectedDensity.color}20`,
              color: selectedDensity.color,
            }}
          >
            {selectedDensity.feeling}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {selectedDensity.description}
        </p>
      </div>
    </div>
  );
};

export default DensitySelector;
