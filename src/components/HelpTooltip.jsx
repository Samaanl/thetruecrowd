const HelpTooltip = () => {
  return (
    <div
      className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg animate-in"
      style={{ animationDelay: "0.5s" }}
    >
      <p className="text-xs text-white/70 flex items-center gap-1.5">
        <svg
          className="w-4 h-4 text-teal-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
        Double-tap to move circle
      </p>
    </div>
  );
};

export default HelpTooltip;
