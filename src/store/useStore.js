import { create } from "zustand";
import { CROWD_PRESETS, DENSITY_MODES, calculateRadius } from "../data/presets";

const useStore = create((set, get) => ({
  // Map state
  map: null,
  setMap: (map) => set({ map }),

  mapCenter: { lng: 0, lat: 20 },
  setMapCenter: (center) => set({ mapCenter: center }),

  mapZoom: 2,
  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  // Theme
  isDark: true,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

  // Map labels toggle
  showLabels: true,
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  // Selected preset
  selectedPreset: CROWD_PRESETS[0],
  setSelectedPreset: (preset) => {
    set({ selectedPreset: preset });
    get().updateOverlay();
  },

  // Selected density
  selectedDensity: DENSITY_MODES[0],
  setSelectedDensity: (density) => {
    set({ selectedDensity: density });
    get().updateOverlay();
  },

  // Custom population (for manual input)
  customPopulation: null,
  setCustomPopulation: (pop) => {
    set({ customPopulation: pop });
    get().updateOverlay();
  },

  // Get effective population
  getPopulation: () => {
    const state = get();
    return state.customPopulation ?? state.selectedPreset.population;
  },

  // Overlay position
  overlayCenter: { lng: 0, lat: 30 },
  setOverlayCenter: (center) => set({ overlayCenter: center }),

  // Overlay visibility
  overlayVisible: true,
  setOverlayVisible: (visible) => set({ overlayVisible: visible }),

  // Calculate overlay radius
  getOverlayRadius: () => {
    const state = get();
    const population = state.getPopulation();
    return calculateRadius(population, state.selectedDensity.areaPerPerson);
  },

  // Update overlay (trigger recalculation)
  updateOverlay: () => {
    // This will trigger re-render in components that depend on these values
    set((state) => ({ ...state }));
  },

  // City name from reverse geocoding
  cityName: null,
  setCityName: (name) => set({ cityName: name }),

  // UI state
  showPresetPanel: true,
  togglePresetPanel: () =>
    set((state) => ({ showPresetPanel: !state.showPresetPanel })),

  showDensityPanel: true,
  toggleDensityPanel: () =>
    set((state) => ({ showDensityPanel: !state.showDensityPanel })),

  showShareModal: false,
  setShowShareModal: (show) => set({ showShareModal: show }),

  // Loading states
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),

  isExporting: false,
  setIsExporting: (exporting) => set({ isExporting: exporting }),

  // User location
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  // Error state
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Toast notifications
  toasts: [],
  addToast: (message, type = "info") => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export default useStore;
