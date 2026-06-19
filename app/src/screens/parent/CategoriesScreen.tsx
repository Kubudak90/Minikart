import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Muted, Card, ToggleRow, Divider, Empty } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { Category } from '../../store/types';
import { CATEGORY_META } from '../../utils/format';
import { colors } from '../../theme/theme';
import { ParentScreenProps } from '../../navigation/types';

const CATS: Category[] = ['market', 'kirtasiye', 'ulasim', 'yemek', 'giyim', 'oyun', 'online', 'eglence', 'atm'];

export function CategoriesScreen({ route }: ParentScreenProps<'Categories'>) {
  const { childId } = route.params;
  const { childCard, toggleCategoryBlock } = useApp();
  const card = childCard(childId);

  if (!card) return <Screen><Empty icon="💳" title="Kart yok" /></Screen>;

  return (
    <Screen>
      <Muted>Açık kategorilerde çocuk harcama yapabilir. Kapatılan kategorilerde kartı çalışmaz.</Muted>
      <Card>
        {CATS.map((cat, i) => {
          const meta = CATEGORY_META[cat];
          const allowed = !card.blockedCategories.includes(cat);
          return (
            <View key={cat}>
              <ToggleRow icon={meta.icon} label={meta.label} sub={allowed ? 'İzinli' : 'Kapalı'} value={allowed} onValueChange={() => toggleCategoryBlock(card.id, cat)} />
              {i < CATS.length - 1 && <Divider />}
            </View>
          );
        })}
      </Card>
      <Muted>Not: Gerçek üründe kategori (MCC) kontrolü kart işlem partnerinin yeteneğine bağlıdır.</Muted>
    </Screen>
  );
}

const s = StyleSheet.create({});
