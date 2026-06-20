// MiniKart Aile - Lucide çizgi ikon sarmalayıcısı.
// Tasarım sistemi: yuvarlak uçlu, 2px stroke çizgi ikonlar (spec §7 → Lucide).
import React from 'react';
import {
  Wallet, PiggyBank, Target, Bell, Shield, Snowflake, Gift, Send, Star, Check,
  Plus, Lock, HandCoins, Users, SlidersHorizontal, ReceiptText, ChevronLeft,
  ChevronRight, House, User, ListChecks, Lightbulb, CreditCard, Repeat, Tag,
  FlaskConical, Globe, Banknote, Smartphone, Plane, Moon, Settings, LogOut,
  ArrowUp, ArrowDown, ShoppingBag, BookOpen, Coins, CircleHelp, Eye, EyeOff,
  Bus, Shirt, Gamepad2, Package, FerrisWheel, Landmark, ShoppingCart, Pencil,
  UtensilsCrossed, Sparkles, Plus as PlusIcon, Hand, CircleCheck, CircleAlert,
  TrendingUp, Clock, Camera,
} from 'lucide-react-native';
import { colors } from '../theme/theme';

const MAP: Record<string, any> = {
  wallet: Wallet, 'piggy-bank': PiggyBank, target: Target, bell: Bell, shield: Shield,
  snowflake: Snowflake, gift: Gift, send: Send, star: Star, check: Check, plus: Plus,
  lock: Lock, 'hand-coins': HandCoins, users: Users, sliders: SlidersHorizontal,
  receipt: ReceiptText, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  home: House, user: User, tasks: ListChecks, lightbulb: Lightbulb, card: CreditCard,
  repeat: Repeat, tag: Tag, flask: FlaskConical, globe: Globe, banknote: Banknote,
  phone: Smartphone, plane: Plane, moon: Moon, settings: Settings, logout: LogOut,
  'arrow-up': ArrowUp, 'arrow-down': ArrowDown, bag: ShoppingBag, book: BookOpen,
  coins: Coins, help: CircleHelp, eye: Eye, 'eye-off': EyeOff, bus: Bus, shirt: Shirt,
  game: Gamepad2, package: Package, ferris: FerrisWheel, atm: Landmark, cart: ShoppingCart,
  pencil: Pencil, food: UtensilsCrossed, sparkles: Sparkles, hand: Hand,
  'check-circle': CircleCheck, 'alert-circle': CircleAlert, trending: TrendingUp, clock: Clock, camera: Camera,
};

export type IconName = keyof typeof MAP | string;

export function Icon({
  name, size = 20, color = colors.text, strokeWidth = 2,
}: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const Cmp = MAP[name] || CircleHelp;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}

// Lavanta yuvarlak zeminde ikon (satır/aksiyon listelerinde)
import { View } from 'react-native';
export function IconCircle({
  name, size = 40, iconSize = 20, bg = colors.lavender, color = colors.primary,
}: { name: IconName; size?: number; iconSize?: number; bg?: string; color?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={iconSize} color={color} />
    </View>
  );
}
