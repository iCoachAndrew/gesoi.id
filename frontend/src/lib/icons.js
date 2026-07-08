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
