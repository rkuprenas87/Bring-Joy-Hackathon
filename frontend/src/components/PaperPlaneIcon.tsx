// Custom paper plane SVG that looks like a real folded origami paper airplane

interface PaperPlaneIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function PaperPlaneIcon({ size = 60, className = "", color }: PaperPlaneIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: "drop-shadow(2px 3px 4px rgba(0,0,0,0.15))" }}
    >
      {/* Main body — top wing surface */}
      <polygon
        points="5,50 95,35 50,55"
        fill={color || "white"}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.5"
      />
      {/* Lower wing surface — slightly darker for depth */}
      <polygon
        points="5,50 95,35 50,70"
        fill={color || "white"}
        opacity="0.85"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="0.5"
      />
      {/* Center fold crease */}
      <line
        x1="5" y1="50"
        x2="95" y2="35"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="0.8"
      />
      {/* Tail fold */}
      <polygon
        points="50,55 50,70 65,60"
        fill={color || "white"}
        opacity="0.7"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.5"
      />
      {/* Wing crease detail — top */}
      <line
        x1="25" y1="50"
        x2="75" y2="42"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="0.4"
      />
      {/* Subtle paper texture highlight */}
      <polygon
        points="10,50 60,43 45,52"
        fill="white"
        opacity="0.3"
      />
    </svg>
  );
}
