interface MarqueeStripProps {
  text: string;
  className?: string;
  speed?: string;
}

const MarqueeStrip = ({ text, className = "", speed = "25s" }: MarqueeStripProps) => {
  const repeated = `${text}  •  `.repeat(12);

  return (
    <div className={`overflow-hidden py-4 ${className}`}>
      <div
        className="flex whitespace-nowrap"
        style={{ animation: `marquee ${speed} linear infinite` }}
      >
        <span className="text-sm md:text-base font-semibold uppercase tracking-[0.2em]">
          {repeated}
        </span>
        <span className="text-sm md:text-base font-semibold uppercase tracking-[0.2em]">
          {repeated}
        </span>
      </div>
    </div>
  );
};

export default MarqueeStrip;
