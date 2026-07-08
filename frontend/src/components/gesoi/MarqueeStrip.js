import Marquee from "react-fast-marquee";

export const MarqueeStrip = ({ items }) => (
  <div className="bg-[#D4AF37] py-5 overflow-hidden border-y border-[#0A2E20]/10" data-testid="editorial-marquee">
    <Marquee speed={30} gradient={false} autoFill>
      {items.map((item) => (
        <span key={item} className="mx-12 flex items-center gap-12">
          <span className="font-serif-display italic text-[#0A2E20] text-xl md:text-2xl">{item}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A2E20]/60" />
        </span>
      ))}
    </Marquee>
  </div>
);
