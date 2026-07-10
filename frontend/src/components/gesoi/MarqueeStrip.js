import Marquee from "react-fast-marquee";

export const MarqueeStrip = ({ items }) => (
  <div className="bg-[#FAFAFA] py-5 overflow-hidden border-y border-slate-100" data-testid="editorial-marquee">
    <Marquee speed={25} gradient={false} autoFill>
      {items.map((item) => (
        <span key={item} className="mx-12 flex items-center gap-12">
          <span className="text-emerald-800 text-xs md:text-sm uppercase tracking-[0.3em] font-medium">{item}</span>
          <span className="w-1 h-1 rounded-full bg-[#B45309]/60" />
        </span>
      ))}
    </Marquee>
  </div>
);
