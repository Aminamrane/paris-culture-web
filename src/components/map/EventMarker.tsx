"use client";

interface EventMarkerProps {
  title: string;
  coverUrl: string | null;
  category: string | null;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  expo: "#2563EB",
  theatre: "#8B5CF6",
  musique: "#3B82F6",
  debats: "#22C55E",
  street: "#EAB308",
  litterature: "#A855F7",
  immersif: "#EC4899",
};

export default function EventMarker({
  title,
  coverUrl,
  category,
  count,
  selected,
  onClick,
}: EventMarkerProps) {
  const color = CATEGORY_COLORS[category || ""] || "#2563EB";

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center transition-transform active:scale-95"
      style={{ transform: selected ? "scale(1.1)" : undefined }}
    >
      {/* Marker bubble */}
      <div
        className="relative rounded-xl overflow-hidden shadow-lg"
        style={{
          width: coverUrl ? 56 : 36,
          height: coverUrl ? 56 : 36,
          border: `3px solid ${color}`,
          background: "white",
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <span className="text-white text-xs font-bold">
              {title.charAt(0)}
            </span>
          </div>
        )}

        {/* Badge count */}
        {count && count > 1 && (
          <div
            className="absolute -bottom-1 -right-1 min-w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
            style={{ backgroundColor: color }}
          >
            +{count}
          </div>
        )}
      </div>

      {/* Arrow pointer */}
      <div
        className="w-3 h-3 -mt-1.5 rotate-45"
        style={{ backgroundColor: color }}
      />

      {/* Label */}
      {selected && (
        <div className="mt-0.5 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-0.5 shadow-sm max-w-[120px]">
          <p className="text-[10px] font-semibold text-gray-800 text-center leading-tight truncate">
            {title}
          </p>
        </div>
      )}
    </button>
  );
}
