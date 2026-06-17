// MiniKart Aile - kutlama (konfeti) overlay'i.
// Spec/Tasarım sistemi motion: çocuk yüzeylerinde oyunlu kutlama —
// hedef tamamlanınca konfeti + "Harika!", görev tamamlanınca rozet kutlaması.
// Animated API (iOS/Android/Web uyumlu). Finansal onaylarda kullanılmaz.
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  View, Text, Animated, Easing, Dimensions, StyleSheet, Image, ImageSourcePropType,
} from 'react-native';
import { colors, fonts, radius, spacing, shadow } from '../theme/theme';

const PALETTE = [colors.primary, colors.green, colors.yellow, colors.pink, colors.red, colors.primaryPress];

type Opts = { title: string; sub?: string; image?: ImageSourcePropType };
const CelebrateCtx = createContext<(o: Opts) => void>(() => {});
export const useCelebrate = () => useContext(CelebrateCtx);

interface Piece { left: number; startY: number; color: string; size: number; spin: number; drift: number; rect: boolean; }

function makePieces(count: number, W: number, H: number): Piece[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * W,
    startY: -40 - Math.random() * H * 0.4,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    size: 8 + Math.random() * 8,
    spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
    drift: (Math.random() - 0.5) * 80,
    rect: Math.random() > 0.4,
  }));
}

function Confetti({ progress, pieces, H }: { progress: Animated.Value; pieces: Piece[]; H: number }) {
  return (
    <>
      {pieces.map((p, i) => {
        const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [p.startY, H + 60] });
        const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
        const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] });
        const opacity = progress.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute', left: p.left, top: 0,
              width: p.size, height: p.rect ? p.size * 0.5 : p.size,
              borderRadius: p.rect ? 2 : p.size, backgroundColor: p.color,
              opacity, transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </>
  );
}

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const { width: W, height: H } = Dimensions.get('window');
  const [opts, setOpts] = useState<Opts | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const pieces = useMemo(() => makePieces(26, W, H), [W, H]);

  const celebrate = useCallback((o: Opts) => {
    setOpts(o);
    progress.setValue(0);
    fade.setValue(0);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 1, duration: 1900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 320, useNativeDriver: true }).start(() => setOpts(null));
    }, 1900);
  }, [fade, progress]);

  return (
    <CelebrateCtx.Provider value={celebrate}>
      {children}
      {opts && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.overlay, { opacity: fade }]}>
          <Confetti progress={progress} pieces={pieces} H={H} />
          <Animated.View style={[s.card, { transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }] }]}>
            {opts.image ? <Image source={opts.image} style={s.img} /> : <Text style={{ fontSize: 52 }}>🎉</Text>}
            <Text style={s.title}>{opts.title}</Text>
            {opts.sub ? <Text style={s.sub}>{opts.sub}</Text> : null}
          </Animated.View>
        </Animated.View>
      )}
    </CelebrateCtx.Provider>
  );
}

const s = StyleSheet.create({
  overlay: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#14152B40', zIndex: 1000 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, alignItems: 'center', gap: 8, maxWidth: 280, ...shadow.purple },
  img: { width: 150, height: 120, resizeMode: 'contain' },
  title: { fontFamily: fonts.headingX, fontSize: 22, color: colors.text, textAlign: 'center' },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
