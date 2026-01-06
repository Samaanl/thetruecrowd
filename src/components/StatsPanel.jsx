import useStore from "../store/useStore";
import {
  formatNumber,
  formatArea,
  getAreaComparison,
  calculateArea,
  getRandomShock,
} from "../data/presets";
import { useMemo } from "react";

const StatsPanel = () => {
  const { selectedPreset, selectedDensity, customPopulation, cityName } =
    useStore();

  const population = customPopulation || selectedPreset.population;

  const stats = useMemo(() => {
    const area = calculateArea(population, selectedDensity.areaPerPerson);
    const formattedArea = formatArea(area);
    const comparison = getAreaComparison(area);

    return {
      area,
      formattedArea,
      comparison,
    };
  }, [population, selectedDensity]);

  const shockPhrase = useMemo(
    () => getRandomShock(),
    [population, selectedDensity]
  );

  return (
    <div className="card max-w-md w-full">
      {/* Main stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Population
          </div>
          <div className="stat-number text-2xl md:text-3xl">
            {formatNumber(population)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Area Required
          </div>
          <div className="stat-number text-2xl md:text-3xl">
            {stats.formattedArea.metric}
          </div>
          <div className="text-xs text-slate-500">
            {stats.formattedArea.imperial}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="p-3 bg-slate-800/50 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </div>
          <span className="text-sm text-slate-300">
            That's{" "}
            <span className="font-semibold text-white">{stats.comparison}</span>
          </span>
        </div>
      </div>

      {/* Caption */}
      <div className="p-4 bg-gradient-to-r from-teal-900/30 to-amber-900/30 rounded-xl border border-teal-500/20">
        <p className="caption-shock text-center">
          {customPopulation
            ? `${formatNumber(population)} people`
            : selectedPreset.name}{" "}
          at{" "}
          <span style={{ color: selectedDensity.color }}>
            {selectedDensity.name}
          </span>{" "}
          density
          {cityName && (
            <>
              {" "}
              placed on{" "}
              <span className="text-white">{cityName.split(",")[0]}</span>
            </>
          )}
        </p>
        <p className="text-center text-slate-400 text-sm mt-2 italic">
          "{shockPhrase}"
        </p>
      </div>

      {/* Quick facts */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-slate-800/30 rounded-lg">
          <div className="text-xs text-slate-500">Per Person</div>
          <div className="text-sm font-medium text-white">
            {selectedDensity.areaPerPerson} m²
          </div>
        </div>
        <div className="p-2 bg-slate-800/30 rounded-lg">
          <div className="text-xs text-slate-500">Density</div>
          <div
            className="text-sm font-medium"
            style={{ color: selectedDensity.color }}
          >
            {selectedDensity.feeling}
          </div>
        </div>
        <div className="p-2 bg-slate-800/30 rounded-lg">
          <div className="text-xs text-slate-500">Radius</div>
          <div className="text-sm font-medium text-white">
            {formatNumber(Math.round(Math.sqrt(stats.area / Math.PI)))} m
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
