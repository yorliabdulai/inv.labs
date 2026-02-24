import { useRef, useEffect, useState } from "react";

// GSE "Heartbeat" — the cardiogram waveform that runs between sections
const Heartbeat = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [opacity, setOpacity] = useState(0.08);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Generate a cardiogram-like path
  const generatePath = () => {
    const points: string[] = [];
    const width = 1920;
    const midY = 20;
    let x = 0;

    while (x < width) {
      // Flat line
      const flatLen = 30 + Math.random() * 60;
      points.push(`L${x + flatLen},${midY}`);
      x += flatLen;

      // Heartbeat spike
      const spikeHeight = 6 + Math.random() * 12;
      const spikeDown = 4 + Math.random() * 8;
      points.push(
        `L${x + 4},${midY - spikeHeight}`,
        `L${x + 8},${midY + spikeDown}`,
        `L${x + 12},${midY}`
      );
      x += 12;
    }

    return `M0,${midY} ${points.join(' ')}`;
  };

  const pathD = useRef(generatePath());

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
    setOpacity(0.4);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setOpacity(0.08);
  };

  return (
    <div className="relative w-full h-10 overflow-hidden cursor-crosshair">
      <svg
        ref={svgRef}
        viewBox="0 0 1920 40"
        preserveAspectRatio="none"
        className="w-full h-full transition-opacity duration-500"
        style={{ opacity }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <path
          d={pathD.current}
          fill="none"
          stroke="hsl(var(--terracotta))"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {hoverX !== null && (
        <div
          className="absolute top-0 bottom-0 w-px bg-terracotta/60 pointer-events-none"
          style={{ left: hoverX }}
        />
      )}
    </div>
  );
};

export default Heartbeat;
