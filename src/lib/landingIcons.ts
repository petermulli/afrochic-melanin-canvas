import {
  Truck, Shield, RefreshCw, Headphones, Sparkles, Heart, Star, Award,
  Gift, Zap, Leaf, Droplets, Sun, Moon, Flower, Flame, Crown, Gem,
  ThumbsUp, CheckCircle2, Package, Tag, Percent, Clock, MapPin, Phone,
  Mail, MessageCircle, Smile, Users, ShoppingBag, CreditCard, Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const LANDING_ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck, shield: Shield, refresh: RefreshCw, headphones: Headphones,
  sparkles: Sparkles, heart: Heart, star: Star, award: Award, gift: Gift,
  zap: Zap, leaf: Leaf, droplets: Droplets, sun: Sun, moon: Moon, flower: Flower,
  flame: Flame, crown: Crown, gem: Gem, "thumbs-up": ThumbsUp, check: CheckCircle2,
  package: Package, tag: Tag, percent: Percent, clock: Clock, "map-pin": MapPin,
  phone: Phone, mail: Mail, message: MessageCircle, smile: Smile, users: Users,
  "shopping-bag": ShoppingBag, "credit-card": CreditCard, lock: Lock,
};

export const LANDING_ICON_KEYS = Object.keys(LANDING_ICON_MAP);

export const getLandingIcon = (key: string | undefined, fallback: LucideIcon): LucideIcon => {
  if (!key) return fallback;
  return LANDING_ICON_MAP[key] ?? fallback;
};
