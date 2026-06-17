import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Screen, H2, Muted, Card, Pill } from '../../components/ui';
import { colors, spacing, radius, font, fonts } from '../../theme/theme';

// Spec §11 Finansal eğitim katmanı — 30 sn mini dersler + quiz + rozetler.
interface Lesson {
  id: string; icon: string; title: string; body: string;
  quiz: { q: string; options: string[]; answer: number; explain: string };
}

const LESSONS: Lesson[] = [
  {
    id: 'l1', icon: '🤔', title: 'İhtiyaç mı, istek mi?',
    body: 'Su almak ihtiyaçtır. Yeni oyun kostümü almak istek olabilir. İstek kötü değildir ama önce hedefini düşün.',
    quiz: { q: 'Okul servisi ödemesi ihtiyaç mı, istek mi?', options: ['İhtiyaç', 'İstek'], answer: 0, explain: 'Okula gitmek için gerekli olduğundan bu bir ihtiyaçtır.' },
  },
  {
    id: 'l2', icon: '🐷', title: 'Birikim nasıl büyür?',
    body: 'Her harçlığından küçük bir parça ayırırsan zamanla büyük bir tutara ulaşırsın. Sabır en büyük gücün.',
    quiz: { q: 'Haftada 20₺ biriktirirsen 4 haftada ne kadar olur?', options: ['40₺', '80₺', '100₺'], answer: 1, explain: '20 × 4 = 80₺. Düzenli birikim böyle büyür!' },
  },
  {
    id: 'l3', icon: '🔒', title: 'Kart güvenliği',
    body: 'Kart şifreni kimseyle paylaşma, arkadaşların bile olsa. Şifren sadece sana aittir.',
    quiz: { q: 'Arkadaşın kart şifreni isterse ne yaparsın?', options: ['Söylerim', 'Söylemem'], answer: 1, explain: 'Doğru! Şifre asla paylaşılmaz.' },
  },
  {
    id: 'l4', icon: '🛒', title: 'Online alışverişte dikkat',
    body: 'İnternetten bir şey almadan önce ailene sor. Tanımadığın sitelere kart bilgini girme.',
    quiz: { q: 'Tanımadığın bir oyun sitesi kart bilgini istiyor, ne yaparsın?', options: ['Girerim', 'Önce aileme sorarım'], answer: 1, explain: 'Aferin! Şüpheli durumlarda her zaman ailene danış.' },
  },
];

function LessonCard({ lesson, onComplete, completed }: { lesson: Lesson; onComplete: () => void; completed: boolean }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <Card style={{ gap: spacing.sm }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={{ fontSize: 30 }}>{lesson.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', fontSize: font.h3, color: colors.text }}>{lesson.title}</Text>
          <Muted>30 saniyelik mini ders</Muted>
        </View>
        {completed ? <Pill text="🏅 Rozet" color={colors.green} bg={colors.greenSoft} /> : <Text style={{ fontSize: 20, color: colors.textFaint }}>{open ? '▾' : '▸'}</Text>}
      </Pressable>

      {open && (
        <View style={{ gap: spacing.md }}>
          <Text style={{ color: colors.text, lineHeight: 21 }}>{lesson.body}</Text>
          <View style={{ backgroundColor: colors.purpleSoft, padding: spacing.md, borderRadius: radius.md, gap: spacing.sm }}>
            <Text style={{ fontWeight: '700', color: colors.purple }}>❓ {lesson.quiz.q}</Text>
            {lesson.quiz.options.map((o, i) => {
              const isPicked = picked === i;
              const correct = i === lesson.quiz.answer;
              const show = picked !== null;
              return (
                <Pressable
                  key={i}
                  onPress={() => { setPicked(i); if (correct) onComplete(); }}
                  style={[s.opt, show && correct && { backgroundColor: colors.greenSoft, borderColor: colors.green }, show && isPicked && !correct && { backgroundColor: colors.redSoft, borderColor: colors.red }]}
                >
                  <Text style={{ fontWeight: '600', color: colors.text }}>{show && correct ? '✓ ' : ''}{o}</Text>
                </Pressable>
              );
            })}
            {picked !== null && (
              <Text style={{ color: picked === lesson.quiz.answer ? colors.green : colors.red, fontWeight: '600' }}>
                {picked === lesson.quiz.answer ? '🎉 Doğru! ' : '🤔 Tekrar dene. '}{lesson.quiz.explain}
              </Text>
            )}
          </View>
        </View>
      )}
    </Card>
  );
}

export function ChildLearnScreen() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const count = Object.values(done).filter(Boolean).length;

  return (
    <Screen bg={colors.bgChild}>
      <Card style={{ backgroundColor: colors.purple, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontFamily: fonts.headingX, fontSize: font.h2 }}>Para Okulu 💡</Text>
          <Text style={{ color: '#ffffffdd', fontFamily: fonts.body, marginTop: 2 }}>Mini dersleri tamamla, rozet kazan!</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.sm, alignItems: 'center' }}>
            {LESSONS.map((l) => (
              <Text key={l.id} style={{ fontSize: 18, opacity: done[l.id] ? 1 : 0.35 }}>🏅</Text>
            ))}
            <Text style={{ color: '#fff', fontFamily: fonts.bold, marginLeft: 4 }}>{count}/{LESSONS.length}</Text>
          </View>
        </View>
        <Image source={require('../../../assets/illustrations/education.png')} style={{ width: 92, height: 92, resizeMode: 'contain' }} />
      </Card>

      {LESSONS.map((l) => (
        <LessonCard key={l.id} lesson={l} completed={!!done[l.id]} onComplete={() => setDone((d) => ({ ...d, [l.id]: true }))} />
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  opt: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12 },
});
