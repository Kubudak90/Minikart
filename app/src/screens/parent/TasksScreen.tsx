import React, { useState } from 'react';
import { View, Text, Image, Modal, Pressable, Alert } from 'react-native';
import { Screen, H2, Muted, Card, Btn, Pill, Empty, Field } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { Task } from '../../store/types';
import { colors, spacing, font } from '../../theme/theme';
import { money } from '../../utils/format';
import { ParentScreenProps } from '../../navigation/types';

const STATUS_META: Record<Task['status'], { label: string; color: string; bg: string }> = {
  open: { label: 'Açık', color: colors.primary, bg: colors.primarySoft },
  submitted: { label: 'Onay bekliyor', color: colors.amber, bg: colors.amberSoft },
  approved: { label: '✓ Onaylandı', color: colors.green, bg: colors.greenSoft },
  rejected: { label: 'Reddedildi', color: colors.red, bg: colors.redSoft },
};

export function TasksScreen({ route, navigation }: ParentScreenProps<'Tasks'>) {
  const { childId } = route.params;
  const { childTasks, approveTask, rejectTask } = useApp();
  const tasks = childTasks(childId);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [viewUri, setViewUri] = useState<string | null>(null);

  const cancelReject = () => { setRejectingId(null); setNote(''); };
  const confirmReject = (id: string) => { rejectTask(id, note.trim() || undefined); cancelReject(); };

  return (
    <Screen>
      <Btn title="Yeni görev oluştur" icon="plus" onPress={() => navigation.navigate('CreateTask', { childId })} />
      {tasks.length === 0 && <Empty icon="📋" title="Görev yok" sub="Çocuğun için ödüllü görev oluştur." />}
      {tasks.map((t) => {
        const m = STATUS_META[t.status];
        return (
          <Card key={t.id} style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: font.h3, fontWeight: '700', color: colors.text }}>{t.title}</Text>
                {t.description ? <Muted>{t.description}</Muted> : null}
              </View>
              <Pill text={m.label} color={m.color} bg={m.bg} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Pill text={`+${money(t.rewardAmount)}`} color={colors.green} bg={colors.greenSoft} />
              <Muted>{t.recurrence === 'repeating' ? 'Tekrarlı' : 'Tek seferlik'}{t.proofRequired ? ' • Kanıt gerekli' : ''}</Muted>
            </View>

            {t.status === 'submitted' && (
              <>
                {t.proofPhotoUri ? (
                  <Pressable onPress={() => setViewUri(t.proofPhotoUri!)}>
                    <Image source={{ uri: t.proofPhotoUri }} style={{ width: '100%', height: 170, borderRadius: 12 }} resizeMode="cover" />
                  </Pressable>
                ) : null}

                {rejectingId === t.id ? (
                  <View style={{ gap: spacing.sm }}>
                    <Field label="Geri gönderme notu" value={note} onChangeText={setNote} placeholder="Örn. yatağı da topla" multiline />
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      <Btn title="Geri gönder" small kind="danger" style={{ flex: 1 }} onPress={() => confirmReject(t.id)} />
                      <Btn title="Vazgeç" small kind="ghost" onPress={cancelReject} />
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Btn title={`Onayla (${money(t.rewardAmount)})`} icon="check" small kind="success" style={{ flex: 1 }} onPress={() => { if (!approveTask(t.id)) Alert.alert('Yetersiz bakiye', 'Aile cüzdanında bu ödülü karşılayacak bakiye yok. Önce bakiye yükleyin, sonra tekrar onaylayın.'); }} />
                    <Btn title="Reddet" small kind="ghost" onPress={() => setRejectingId(t.id)} />
                  </View>
                )}
              </>
            )}
          </Card>
        );
      })}

      <Modal visible={!!viewUri} transparent animationType="fade" onRequestClose={() => setViewUri(null)}>
        <Pressable onPress={() => setViewUri(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          {viewUri ? <Image source={{ uri: viewUri }} style={{ width: '100%', height: '70%', borderRadius: 16 }} resizeMode="contain" /> : null}
          <Text style={{ color: '#fff', marginTop: 16, fontSize: font.body }}>Kapatmak için dokun</Text>
        </Pressable>
      </Modal>
    </Screen>
  );
}
