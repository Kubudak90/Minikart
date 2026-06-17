import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Screen, Card, Muted, Divider, Empty } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, font } from '../../theme/theme';
import { timeAgo } from '../../utils/format';

const ICONS: Record<string, string> = {
  reward: '🏅', allowance: '💛', goal: '🎯', spend: '🛍️', limit: '⚠️', request: '🙋', task: '📋',
};

export function ChildNotificationsScreen() {
  const { currentChild, notifications, markAllRead } = useApp();
  const child = currentChild();
  const notifs = child ? notifications('child', child.id) : [];

  useEffect(() => {
    if (child) markAllRead('child', child.id);
  }, [child?.id]);

  return (
    <Screen bg={colors.bgChild}>
      {notifs.length === 0 ? (
        <Empty icon="🔔" title="Bildirim yok" />
      ) : (
        <Card>
          {notifs.map((n, i) => (
            <View key={n.id}>
              <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 10 }}>
                <Text style={{ fontSize: 22 }}>{ICONS[n.type] || '🔔'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{n.title}</Text>
                  <Muted>{n.body}</Muted>
                  <Text style={{ fontSize: font.tiny, color: colors.textFaint, marginTop: 2 }}>{timeAgo(n.createdAt)}</Text>
                </View>
              </View>
              {i < notifs.length - 1 && <Divider />}
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
