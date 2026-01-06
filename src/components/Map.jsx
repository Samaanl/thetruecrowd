import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import useStore from "../store/useStore";

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const circleOverlay = useRef(null);
  const mirrorCircles = useRef([]); // Mirror circles for world wrap effect
  const labelsLayer = useRef(null);
  const isDragging = useRef(false);
  const [showCenterButton, setShowCenterButton] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [hintDismissed, setHintDismissed] = useState(false);
  const interactionCount = useRef(0);

  const {
    setMap,
    isDark,
    overlayCenter,
    setOverlayCenter,
    overlayVisible,
    selectedDensity,
    selectedPreset,
    customPopulation,
    getOverlayRadius,
    setIsLoading,
    setUserLocation,
    setCityName,
    addToast,
    showLabels,
  } = useStore();

  // Reverse geocode using free Nominatim API
  const reverseGeocode = useCallback(
    async (lng, lat) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
        );
        const data = await response.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(",");
          setCityName(parts.slice(0, 3).join(",").trim());
        } else {
          setCityName(null);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setCityName(null);
      }
    },
    [setCityName]
  );

  // Get tile layer based on theme (base map without labels)
  const getTileLayer = useCallback((dark) => {
    if (dark) {
      return L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution: "",
          subdomains: "abcd",
          maxZoom: 20,
        }
      );
    }
    return L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      {
        attribution: "",
        subdomains: "abcd",
        maxZoom: 20,
      }
    );
  }, []);

  // Get labels layer based on theme
  const getLabelsLayer = useCallback((dark) => {
    if (dark) {
      return L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
        {
          attribution: "",
          subdomains: "abcd",
          maxZoom: 20,
          pane: "overlayPane",
        }
      );
    }
    return L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
      {
        attribution: "",
        subdomains: "abcd",
        maxZoom: 20,
        pane: "overlayPane",
      }
    );
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: false, // We handle world wrap manually with mirror circles
    });
    getTileLayer(isDark).addTo(map.current);

    // Add labels layer if enabled
    if (showLabels) {
      labelsLayer.current = getLabelsLayer(isDark);
      labelsLayer.current.addTo(map.current);
    }

    // Create circle overlay
    const radius = getOverlayRadius();
    const circleStyle = {
      radius: radius,
      color: selectedDensity.color,
      fillColor: selectedDensity.color,
      fillOpacity: 0.35,
      weight: 3,
      opacity: 0.8,
    };

    circleOverlay.current = L.circle(
      [overlayCenter.lat, overlayCenter.lng],
      circleStyle
    ).addTo(map.current);

    // Create mirror circles for world wrap effect (one left, one right)
    const mirrorLeft = L.circle([overlayCenter.lat, overlayCenter.lng - 360], {
      ...circleStyle,
      interactive: false, // Only main circle is interactive
    }).addTo(map.current);

    const mirrorRight = L.circle([overlayCenter.lat, overlayCenter.lng + 360], {
      ...circleStyle,
      interactive: false,
    }).addTo(map.current);

    mirrorCircles.current = [mirrorLeft, mirrorRight];

    // Helper function to update all mirror circles
    const updateMirrorCircles = (lat, lng) => {
      mirrorCircles.current[0].setLatLng([lat, lng - 360]);
      mirrorCircles.current[1].setLatLng([lat, lng + 360]);
    };

    // Make circle draggable - mouse events
    let startLatLng = null;

    circleOverlay.current.on("mousedown", (e) => {
      isDragging.current = true;
      startLatLng = e.latlng;
      map.current.dragging.disable();
      L.DomUtil.addClass(map.current.getContainer(), "grabbing");
    });

    map.current.on("mousemove", (e) => {
      if (!isDragging.current || !startLatLng) return;

      const currentCenter = circleOverlay.current.getLatLng();
      const newLat = currentCenter.lat + (e.latlng.lat - startLatLng.lat);
      const newLng = currentCenter.lng + (e.latlng.lng - startLatLng.lng);

      circleOverlay.current.setLatLng([newLat, newLng]);
      updateMirrorCircles(newLat, newLng);
      startLatLng = e.latlng;
    });

    map.current.on("mouseup", () => {
      if (isDragging.current) {
        isDragging.current = false;
        map.current.dragging.enable();
        L.DomUtil.removeClass(map.current.getContainer(), "grabbing");

        const center = circleOverlay.current.getLatLng();
        // Normalize longitude to -180 to 180 range for geocoding
        let normalizedLng = center.lng;
        while (normalizedLng > 180) normalizedLng -= 360;
        while (normalizedLng < -180) normalizedLng += 360;

        setOverlayCenter({ lng: center.lng, lat: center.lat });
        reverseGeocode(normalizedLng, center.lat);
      }
    });

    // Double-click/double-tap to move circle to that location (works on both desktop and mobile)
    map.current.on("dblclick", (e) => {
      // Move circle to double-click location
      circleOverlay.current.setLatLng(e.latlng);
      updateMirrorCircles(e.latlng.lat, e.latlng.lng);
      setOverlayCenter({ lng: e.latlng.lng, lat: e.latlng.lat });

      // Normalize longitude for geocoding
      let normalizedLng = e.latlng.lng;
      while (normalizedLng > 180) normalizedLng -= 360;
      while (normalizedLng < -180) normalizedLng += 360;
      reverseGeocode(normalizedLng, e.latlng.lat);

      // Hide hint on interaction
      setShowHint(false);
      setHintDismissed(true);
      interactionCount.current += 1;

      // Prevent default zoom on double-click
      e.originalEvent.preventDefault();
    });

    // Disable default double-click zoom since we're using it for circle placement
    map.current.doubleClickZoom.disable();

    // Cursor styling
    circleOverlay.current.on("mouseover", () => {
      if (!isDragging.current) {
        L.DomUtil.addClass(map.current.getContainer(), "grab");
      }
    });

    circleOverlay.current.on("mouseout", () => {
      if (!isDragging.current) {
        L.DomUtil.removeClass(map.current.getContainer(), "grab");
      }
    });

    setMap(map.current);
    setIsLoading(false);

    // Check if circle is visible in viewport
    const checkCircleVisibility = () => {
      if (!map.current || !circleOverlay.current) return;

      const bounds = map.current.getBounds();
      const circleCenter = circleOverlay.current.getLatLng();
      const isVisible = bounds.contains(circleCenter);
      setShowCenterButton(!isVisible);
    };

    map.current.on("moveend", checkCircleVisibility);
    map.current.on("zoomend", checkCircleVisibility);

    // Initial geocode for default location
    reverseGeocode(overlayCenter.lng, overlayCenter.lat);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update theme and labels
  useEffect(() => {
    if (!map.current) return;

    // Remove all tile layers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.current.removeLayer(layer);
      }
    });

    // Add base tile layer
    getTileLayer(isDark).addTo(map.current);

    // Add labels layer if enabled
    if (showLabels) {
      labelsLayer.current = getLabelsLayer(isDark);
      labelsLayer.current.addTo(map.current);
    } else {
      labelsLayer.current = null;
    }
  }, [isDark, showLabels, getTileLayer, getLabelsLayer]);

  // Update circle when parameters change
  useEffect(() => {
    if (!circleOverlay.current) return;

    const radius = getOverlayRadius();
    console.log(
      "Updating circle radius:",
      radius,
      "for population:",
      selectedPreset?.population || customPopulation
    );

    const style = {
      color: selectedDensity.color,
      fillColor: selectedDensity.color,
      opacity: overlayVisible ? 0.8 : 0,
      fillOpacity: overlayVisible ? 0.35 : 0,
    };

    circleOverlay.current.setRadius(radius);
    circleOverlay.current.setStyle(style);

    // Update mirror circles too
    mirrorCircles.current.forEach((circle) => {
      circle.setRadius(radius);
      circle.setStyle(style);
    });
  }, [
    overlayVisible,
    selectedDensity,
    selectedPreset,
    customPopulation,
    getOverlayRadius,
  ]);

  // Center map on circle
  const centerOnCircle = useCallback(() => {
    if (!map.current || !circleOverlay.current) return;

    const center = circleOverlay.current.getLatLng();
    const radius = circleOverlay.current.getRadius();

    // Calculate appropriate zoom level based on circle size
    const bounds = circleOverlay.current.getBounds();
    map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    setShowCenterButton(false);
  }, []);

  // Sync overlay center
  useEffect(() => {
    if (!circleOverlay.current) return;

    const currentCenter = circleOverlay.current.getLatLng();
    if (
      Math.abs(currentCenter.lat - overlayCenter.lat) > 0.0001 ||
      Math.abs(currentCenter.lng - overlayCenter.lng) > 0.0001
    ) {
      circleOverlay.current.setLatLng([overlayCenter.lat, overlayCenter.lng]);
      // Update mirror circles too
      mirrorCircles.current[0]?.setLatLng([
        overlayCenter.lat,
        overlayCenter.lng - 360,
      ]);
      mirrorCircles.current[1]?.setLatLng([
        overlayCenter.lat,
        overlayCenter.lng + 360,
      ]);
    }
  }, [overlayCenter]);

  // Smart hint logic - show on load, hide after interaction, occasionally remind
  useEffect(() => {
    // Show hint for first 5 seconds
    const initialTimer = setTimeout(() => {
      if (!hintDismissed) {
        setShowHint(false);
      }
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, []);

  // Show hint again after 30 seconds if user hasn't found the feature yet
  useEffect(() => {
    if (hintDismissed && interactionCount.current < 2) {
      const reminderTimer = setTimeout(() => {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
      }, 25000);
      return () => clearTimeout(reminderTimer);
    }
  }, [hintDismissed]);

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 w-full h-full z-0"
      id="map-container"
    >
      {/* Center on circle button - shows when circle is out of view */}
      {showCenterButton && (
        <button
          onClick={centerOnCircle}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] 
                   bg-teal-600 hover:bg-teal-500 text-white 
                   px-4 py-2 rounded-full shadow-lg
                   flex items-center gap-2 text-sm font-medium
                   animate-pulse transition-all"
        >
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
              d="M15 10l-4 4m0 0l-4-4m4 4V3m0 18a9 9 0 110-18 9 9 0 010 18z"
            />
          </svg>
          Go to Circle
        </button>
      )}

      {/* Smart hint card - shows on load, fades out, occasionally reminds */}
      {showHint && (
        <div
          className="absolute z-[1000] pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="bg-gradient-to-r from-teal-600 to-emerald-600 
                        text-white px-4 py-3 rounded-2xl shadow-2xl
                        flex items-center gap-3
                        border border-white/20 hint-float"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
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
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">
                Double-tap to move circle
              </span>
              <span className="text-white/70 text-xs">
                Tap anywhere on the map
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Watermark - inside container so it appears in exports */}
      <div className="absolute bottom-4 right-4 z-[1000] pointer-events-none select-none">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <span className="text-white text-sm font-bold tracking-wide">
            TheTrueCrowd.com
          </span>
        </div>
      </div>
    </div>
  );
};

export default Map;
