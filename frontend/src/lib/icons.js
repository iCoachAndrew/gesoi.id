import {
  School, Baby, CalendarCheck, Users, PartyPopper, BookOpen,
  FlaskConical, Megaphone, Cpu, Network, Brain, Heart, Shield,
  Landmark, Globe, Lightbulb, GraduationCap, Building2, Handshake,
  Activity, Sparkles, Star, Target, Rocket, Leaf, Award, Microscope,
} from "lucide-react";

export const ICONS = {
  school: School,
  baby: Baby,
  calendar: CalendarCheck,
  users: Users,
  party: PartyPopper,
  book: BookOpen,
  flask: FlaskConical,
  megaphone: Megaphone,
  cpu: Cpu,
  network: Network,
  brain: Brain,
  heart: Heart,
  shield: Shield,
  landmark: Landmark,
  globe: Globe,
  lightbulb: Lightbulb,
  graduation: GraduationCap,
  building: Building2,
  handshake: Handshake,
  activity: Activity,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  rocket: Rocket,
  leaf: Leaf,
  award: Award,
  microscope: Microscope,
};

export const getIcon = (name) => ICONS[name] || Brain;

export const parseIcon = (value) => {
  if (!value) return { base: "brain", scale: 1, isUrl: false };
  let base = value;
  let scale = 1;
  const at = value.lastIndexOf("@");
  if (at > 0) {
    const s = parseInt(value.slice(at + 1), 10);
    if (!isNaN(s) && s >= 10 && s <= 400) {
      scale = s / 100;
      base = value.slice(0, at);
    }
  }
  return { base, scale, isUrl: /^https?:\/\//.test(base) || base.startsWith("/") };
};

export const SectionIcon = ({ icon, size = 18, className = "" }) => {
  const { base, scale, isUrl } = parseIcon(icon);
  const px = Math.round(size * scale);
  if (isUrl) {
    return <img src={base} alt="" style={{ width: px, height: px }} className={`object-contain ${className}`} />;
  }
  const I = ICONS[base] || Brain;
  return <I size={px} className={className} />;
};
