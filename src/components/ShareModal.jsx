import { useState, useCallback, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import useStore from "../store/useStore";
import { formatNumber, formatArea, calculateArea } from "../data/presets";

const ShareModal = () => {
  const {
    showShareModal,
    setShowShareModal,
    selectedPreset,
    selectedDensity,
    customPopulation,
    cityName,
    isExporting,
    setIsExporting,
    addToast,
    map,
    overlayCenter,
    getOverlayRadius,
  } = useStore();

  const [exportedImage, setExportedImage] = useState(null);
  const [exportedBlob, setExportedBlob] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("landscape"); // landscape, square, portrait

  // Ref to track if we should regenerate on modal open
  const generateImageRef = useRef(null);

  const IMAGE_FORMATS = {
    landscape: {
      label: "Landscape",
      ratio: "16:9",
      width: 1920,
      height: 1080,
      icon: "▬",
    },
    square: {
      label: "Square",
      ratio: "1:1",
      width: 1080,
      height: 1080,
      icon: "■",
    },
    portrait: {
      label: "Portrait",
      ratio: "9:16",
      width: 1080,
      height: 1920,
      icon: "▮",
    },
  };

  const population = customPopulation || selectedPreset.population;
  const area = calculateArea(population, selectedDensity.areaPerPerson);
  const formattedArea = formatArea(area);

  const defaultCaption = `${formatNumber(population)} people at ${
    selectedDensity.name
  } density${
    cityName ? ` on ${cityName.split(",")[0]}` : ""
  }. Your brain is lying to you.`;

  const [editableCaption, setEditableCaption] = useState(defaultCaption);
  const hashtags = "#TheTrueCrowd #Population #Scale #MindBlowing";

  // Update caption when preset/density changes
  useEffect(() => {
    setEditableCaption(defaultCaption);
  }, [defaultCaption]);

  // Store generateImage in a ref so useEffect always uses latest version
  useEffect(() => {
    generateImageRef.current = generateImage;
  });

  // Auto-generate image when modal opens - ALWAYS regenerate fresh
  useEffect(() => {
    if (showShareModal) {
      // Reset and regenerate with current map state
      setExportedImage(null);
      setExportedBlob(null);
      const timer = setTimeout(() => {
        if (generateImageRef.current) {
          generateImageRef.current(selectedFormat);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showShareModal, selectedFormat]);

  // Reset caption when modal opens with new preset
  useEffect(() => {
    if (showShareModal) {
      setEditableCaption(defaultCaption);
    }
  }, [showShareModal, defaultCaption]);

  const generateImage = useCallback(
    async (format = selectedFormat) => {
      setIsExporting(true);
      setExportedImage(null);
      setExportedBlob(null);

      try {
        const mapContainer = document.getElementById("map-container");
        if (!mapContainer) {
          throw new Error("Map container not found");
        }

        // Center the map on the circle before taking screenshot
        if (map) {
          const radius = getOverlayRadius();
          // Create bounds around the circle center
          const L = window.L;
          if (L) {
            const circleBounds = L.latLng(
              overlayCenter.lat,
              overlayCenter.lng
            ).toBounds(radius * 2.5);
            map.fitBounds(circleBounds, {
              padding: [50, 50],
              maxZoom: 18,
              animate: false,
            });
          }
        }

        // Wait for map to render after centering
        await new Promise((resolve) => setTimeout(resolve, 800));

        const formatConfig = IMAGE_FORMATS[format];

        // Create a canvas to crop/resize the image
        const fullDataUrl = await toPng(mapContainer, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: "#0f172a",
        });

        // Load the image and crop to selected format
        const img = new Image();
        img.src = fullDataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement("canvas");
        canvas.width = formatConfig.width;
        canvas.height = formatConfig.height;
        const ctx = canvas.getContext("2d");

        // Calculate crop area (center crop)
        const imgAspect = img.width / img.height;
        const targetAspect = formatConfig.width / formatConfig.height;

        let srcX = 0,
          srcY = 0,
          srcW = img.width,
          srcH = img.height;

        if (imgAspect > targetAspect) {
          // Image is wider - crop sides
          srcW = img.height * targetAspect;
          srcX = (img.width - srcW) / 2;
        } else {
          // Image is taller - crop top/bottom
          srcH = img.width / targetAspect;
          srcY = (img.height - srcH) / 2;
        }

        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcW,
          srcH,
          0,
          0,
          formatConfig.width,
          formatConfig.height
        );

        // Draw watermark on the canvas (always visible regardless of crop)
        const watermarkText = "TheTrueCrowd.com";
        const padding = 20;
        const fontSize = Math.max(24, formatConfig.width / 40); // Scale font with image size

        ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";

        // Measure text for background
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;

        // Draw semi-transparent background pill
        const bgPadding = 12;
        const bgX = formatConfig.width - padding - textWidth - bgPadding * 2;
        const bgY = formatConfig.height - padding - textHeight - bgPadding;
        const bgWidth = textWidth + bgPadding * 2;
        const bgHeight = textHeight + bgPadding * 1.5;

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 8);
        ctx.fill();

        // Draw text
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fillText(
          watermarkText,
          formatConfig.width - padding - bgPadding,
          formatConfig.height - padding - bgPadding / 2
        );

        // ===== SLEEK INFO STRIP (Bottom-left, minimal & non-intrusive) =====
        const stripPadding = format === "portrait" ? 20 : 24;
        const stripX = stripPadding;
        const stripHeight = format === "portrait" ? 90 : 72;
        const stripY = formatConfig.height - stripPadding - stripHeight - 50; // Above watermark
        const stripWidth =
          format === "portrait"
            ? formatConfig.width - stripPadding * 2
            : Math.min(520, formatConfig.width * 0.5);
        const stripRadius = 14;

        // Ultra-subtle frosted glass background
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(stripX, stripY, stripWidth, stripHeight, stripRadius);
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        const s = format === "portrait" ? 1.15 : 1; // Scale factor
        const contentY = stripY + stripHeight / 2;
        const col1X = stripX + 18;
        const col2X = stripX + stripWidth * 0.35;
        const col3X = stripX + stripWidth * 0.62;
        const col4X = stripX + stripWidth * 0.85;

        // Helper: Draw simple vector icons
        const drawIcon = (x, y, type, size, color) => {
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = 1.5 * s;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (type === "users") {
            // People icon - two circles and body arcs
            const r = size * 0.22;
            // Person 1
            ctx.beginPath();
            ctx.arc(x - size * 0.18, y - size * 0.2, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x - size * 0.18, y + size * 0.25, r * 1.3, Math.PI, 0);
            ctx.stroke();
            // Person 2
            ctx.beginPath();
            ctx.arc(x + size * 0.18, y - size * 0.2, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + size * 0.18, y + size * 0.25, r * 1.3, Math.PI, 0);
            ctx.stroke();
          } else if (type === "grid") {
            // Area grid icon
            const g = size * 0.35;
            ctx.strokeRect(x - g, y - g, g * 2, g * 2);
            ctx.beginPath();
            ctx.moveTo(x, y - g);
            ctx.lineTo(x, y + g);
            ctx.moveTo(x - g, y);
            ctx.lineTo(x + g, y);
            ctx.stroke();
          } else if (type === "density") {
            // Density/target icon
            const r = size * 0.35;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === "ruler") {
            // Ruler/measure icon
            const w = size * 0.4;
            ctx.strokeRect(x - w, y - size * 0.15, w * 2, size * 0.3);
            ctx.beginPath();
            for (let i = -w + size * 0.12; i < w; i += size * 0.2) {
              ctx.moveTo(x + i, y - size * 0.15);
              ctx.lineTo(x + i, y);
            }
            ctx.stroke();
          }
        };

        // Column 1: Population
        drawIcon(
          col1X + 10 * s,
          contentY - 8 * s,
          "users",
          20 * s,
          selectedDensity.color
        );
        ctx.font = `600 ${9 * s}px system-ui, sans-serif`;
        ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("POPULATION", col1X + 26 * s, contentY - 14 * s);

        ctx.font = `bold ${18 * s}px system-ui, sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.fillText(
          formatNumber(population),
          col1X + 26 * s,
          contentY + 8 * s
        );

        // Preset name below (smaller)
        const presetName = selectedPreset?.name || "Custom";
        ctx.font = `500 ${8 * s}px system-ui, sans-serif`;
        ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
        const shortName =
          presetName.length > 18
            ? presetName.substring(0, 16) + "…"
            : presetName;
        ctx.fillText(shortName, col1X + 26 * s, contentY + 24 * s);

        // Column 2: Density Mode
        drawIcon(
          col2X + 10 * s,
          contentY - 8 * s,
          "density",
          18 * s,
          selectedDensity.color
        );
        ctx.font = `600 ${9 * s}px system-ui, sans-serif`;
        ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        ctx.fillText("DENSITY", col2X + 26 * s, contentY - 14 * s);

        ctx.font = `bold ${14 * s}px system-ui, sans-serif`;
        ctx.fillStyle = selectedDensity.color;
        ctx.fillText(selectedDensity.name, col2X + 26 * s, contentY + 8 * s);

        // Space per person
        ctx.font = `500 ${10 * s}px system-ui, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText(
          selectedDensity.areaPerPerson + " m²/person",
          col2X + 26 * s,
          contentY + 24 * s
        );

        // Column 3: Total Area
        drawIcon(
          col3X + 10 * s,
          contentY - 8 * s,
          "grid",
          18 * s,
          selectedDensity.color
        );
        ctx.font = `600 ${9 * s}px system-ui, sans-serif`;
        ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        ctx.fillText("AREA", col3X + 26 * s, contentY - 14 * s);

        ctx.font = `bold ${16 * s}px system-ui, sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.fillText(formattedArea.metric, col3X + 26 * s, contentY + 8 * s);

        // Imperial conversion
        ctx.font = `500 ${9 * s}px system-ui, sans-serif`;
        ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
        ctx.fillText(formattedArea.imperial, col3X + 26 * s, contentY + 24 * s);

        // Column 4: Location (if available) - vertical divider + location
        if (cityName) {
          // Subtle vertical divider
          ctx.beginPath();
          ctx.moveTo(col4X - 10 * s, stripY + 15);
          ctx.lineTo(col4X - 10 * s, stripY + stripHeight - 15);
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Location pin icon
          ctx.beginPath();
          ctx.arc(col4X + 6 * s, contentY - 12 * s, 4 * s, 0, Math.PI * 2);
          ctx.fillStyle = selectedDensity.color;
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(col4X + 6 * s, contentY - 8 * s);
          ctx.lineTo(col4X + 6 * s, contentY + 2 * s);
          ctx.lineTo(col4X + 2 * s, contentY - 4 * s);
          ctx.lineTo(col4X + 10 * s, contentY - 4 * s);
          ctx.closePath();
          ctx.fill();

          ctx.font = `500 ${10 * s}px system-ui, sans-serif`;
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.textAlign = "left";
          const locText = cityName.split(",")[0].substring(0, 12);
          ctx.fillText(locText, col4X + 16 * s, contentY - 6 * s);

          if (cityName.split(",")[1]) {
            ctx.font = `400 ${8 * s}px system-ui, sans-serif`;
            ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
            ctx.fillText(
              cityName.split(",")[1]?.trim().substring(0, 15) || "",
              col4X + 16 * s,
              contentY + 8 * s
            );
          }
        }

        const dataUrl = canvas.toDataURL("image/png", 0.95);

        // Convert data URL to blob for sharing
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        setExportedImage(dataUrl);
        setExportedBlob(blob);
        addToast(`${formatConfig.label} image ready!`, "success");
      } catch (error) {
        console.error("Export error:", error);
        addToast("Failed to generate image", "error");
      } finally {
        setIsExporting(false);
      }
    },
    [
      selectedFormat,
      setIsExporting,
      addToast,
      selectedDensity,
      selectedPreset,
      population,
      formattedArea,
      cityName,
      map,
      overlayCenter,
      getOverlayRadius,
    ]
  );

  const downloadImage = useCallback(() => {
    if (!exportedImage) return;

    const link = document.createElement("a");
    link.download = `thetruecrowd-${selectedFormat}-${Date.now()}.png`;
    link.href = exportedImage;
    link.click();
    addToast("Image downloaded!", "success");
  }, [exportedImage, selectedFormat, addToast]);

  const copyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `${editableCaption}\n\n${hashtags}\n\nhttps://thetruecrowd.com`
      );
      setCopySuccess(true);
      addToast("Caption copied!", "success");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      addToast("Failed to copy", "error");
    }
  }, [editableCaption, addToast]);

  const shareToTwitter = useCallback(async () => {
    if (!exportedBlob) {
      addToast("Generate an image first!", "error");
      return;
    }

    setIsSharing(true);

    try {
      // On mobile with Web Share API file support, use native share
      if (
        navigator.canShare &&
        navigator.canShare({
          files: [
            new File([exportedBlob], "thetruecrowd.png", { type: "image/png" }),
          ],
        })
      ) {
        const file = new File([exportedBlob], "thetruecrowd.png", {
          type: "image/png",
        });

        await navigator.share({
          text: `${editableCaption}\n\n${hashtags}\n\nhttps://thetruecrowd.com`,
          files: [file],
        });

        addToast("Shared successfully!", "success");
      } else {
        // Desktop: Twitter doesn't support image upload via URL
        // So we download the image first, then open Twitter

        // Download the image automatically
        const link = document.createElement("a");
        link.download = `thetruecrowd-${Date.now()}.png`;
        link.href = exportedImage;
        link.click();

        // Small delay to ensure download starts
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Open Twitter compose
        const text = encodeURIComponent(`${editableCaption}\n\n${hashtags}`);
        const url = encodeURIComponent("https://thetruecrowd.com");
        window.open(
          `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
          "_blank"
        );

        addToast(
          "Image downloaded! Click the image icon in tweet to attach it.",
          "info"
        );
      }
    } catch (error) {
      console.error("Share error:", error);
      // Fallback - still download and open Twitter
      downloadImage();
      const text = encodeURIComponent(`${editableCaption}\n\n${hashtags}`);
      const url = encodeURIComponent("https://thetruecrowd.com");
      window.open(
        `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        "_blank"
      );
      addToast("Image downloaded! Attach it to your tweet.", "info");
    } finally {
      setIsSharing(false);
    }
  }, [editableCaption, exportedBlob, downloadImage, addToast]);

  const shareNative = useCallback(async () => {
    if (!exportedBlob) {
      addToast("Generate an image first!", "error");
      return;
    }

    try {
      const file = new File([exportedBlob], "thetruecrowd.png", {
        type: "image/png",
      });

      // Check if native share with files is supported
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "TheTrueCrowd",
          text: `${editableCaption}\n\n${hashtags}`,
          url: "https://thetruecrowd.com",
          files: [file],
        });
        addToast("Shared successfully!", "success");
      } else if (navigator.share) {
        // Share without file (text only)
        await navigator.share({
          title: "TheTrueCrowd",
          text: `${editableCaption}\n\n${hashtags}\n\nhttps://thetruecrowd.com`,
        });
        addToast("Shared! Download image to attach it.", "info");
      } else {
        // No native share - copy to clipboard
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": exportedBlob,
            }),
          ]);
          addToast("Image copied to clipboard!", "success");
        } catch {
          downloadImage();
          addToast("Image downloaded!", "success");
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share error:", error);
        // Fallback to download
        downloadImage();
        addToast("Image downloaded instead", "info");
      }
    }
  }, [editableCaption, exportedBlob, downloadImage, addToast]);

  if (!showShareModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setShowShareModal(false)}
      />

      {/* Modal - slides up on mobile, centered on desktop */}
      <div
        className="relative glass-dark w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl animate-in overflow-hidden"
        style={{
          maxHeight: "min(90dvh, 90vh)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Handle for mobile */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Header - compact */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-bold text-white">Share</h2>
          <button
            onClick={() => setShowShareModal(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
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

        {/* Content - scrollable */}
        <div
          className="px-4 pb-4 overflow-y-auto"
          style={{ maxHeight: "calc(85dvh - 60px)" }}
        >
          {/* Preview with format selector inline */}
          <div className="relative mb-4">
            {/* Format pills - floating on top of preview */}
            <div className="absolute top-2 left-2 z-10 flex gap-1">
              {Object.entries(IMAGE_FORMATS).map(([key, format]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedFormat(key);
                    setExportedImage(null);
                    setExportedBlob(null);
                    setTimeout(() => generateImage(key), 100);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedFormat === key
                      ? "bg-teal-500 text-white"
                      : "bg-black/50 text-white/70 hover:bg-black/70"
                  }`}
                >
                  {format.ratio}
                </button>
              ))}
            </div>

            {/* Preview container */}
            <div
              className={`bg-slate-800 rounded-xl overflow-hidden relative mx-auto ${
                selectedFormat === "portrait"
                  ? "w-32 aspect-[9/16]"
                  : selectedFormat === "square"
                  ? "w-48 aspect-square"
                  : "w-full aspect-video"
              }`}
            >
              {exportedImage ? (
                <img
                  src={exportedImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isExporting ? (
                    <div className="flex flex-col items-center">
                      <svg
                        className="animate-spin w-6 h-6 text-teal-500"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span className="text-xs text-slate-400 mt-2">
                        Generating...
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => generateImage()}
                      className="text-sm text-teal-400 hover:text-teal-300"
                    >
                      ↻ Regenerate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Caption - compact */}
          <div className="mb-4">
            <textarea
              value={editableCaption}
              onChange={(e) => setEditableCaption(e.target.value)}
              className="w-full p-3 bg-slate-800/50 rounded-xl text-sm text-slate-200 
                       border border-slate-700 focus:border-teal-500 focus:outline-none
                       transition-all resize-none"
              rows={2}
              placeholder="Your caption..."
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-teal-400 text-xs truncate flex-1">
                {hashtags}
              </p>
              <button
                onClick={copyCaption}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition-colors"
              >
                {copySuccess ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Stats row - minimal */}
          <div className="flex items-center justify-center gap-4 mb-4 py-2 bg-slate-800/30 rounded-xl">
            <div className="text-center">
              <span className="text-white font-bold">
                {formatNumber(population)}
              </span>
              <span className="text-slate-500 text-xs ml-1">people</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="text-center">
              <span className="text-white font-bold">
                {formattedArea.metric}
              </span>
              <span className="text-slate-500 text-xs ml-1">area</span>
            </div>
          </div>

          {/* Action buttons - single row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={downloadImage}
              disabled={!exportedImage}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all ${
                exportedImage
                  ? "bg-slate-800 hover:bg-slate-700 text-white"
                  : "bg-slate-800/50 text-slate-500 cursor-not-allowed"
              }`}
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="text-xs">Save</span>
            </button>

            <button
              onClick={shareToTwitter}
              disabled={!exportedImage || isSharing}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all ${
                exportedImage && !isSharing
                  ? "bg-slate-800 hover:bg-slate-700 text-white"
                  : "bg-slate-800/50 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isSharing ? (
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              )}
              <span className="text-xs">X</span>
            </button>

            <button
              onClick={shareNative}
              disabled={!exportedImage}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all ${
                exportedImage
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 hover:opacity-90 text-white"
                  : "bg-slate-800/50 text-slate-500 cursor-not-allowed"
              }`}
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
              <span className="text-xs">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
