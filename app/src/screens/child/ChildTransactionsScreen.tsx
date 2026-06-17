import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Divider, Empty } from '../../components/ui';
import { TxRow } from '../../components/TxRow';
import { useApp } from '../../store/AppContext';
import { colors } from '../../theme/theme';

export function ChildTransactionsScreen() {
  const { currentChild, childTransactions } = useApp();
  const child = currentChild();
  const txs = child ? childTransactions(child.id) : [];

  return (
    <Screen bg={colors.bgChild}>
      {txs.length === 0 ? (
        <Empty icon="📜" title="Henüz hareket yok" sub="Harçlık ve harcamaların burada görünecek." />
      ) : (
        <Card>
          {txs.map((t, i) => (
            <View key={t.id}>
              <TxRow tx={t} />
              {i < txs.length - 1 && <Divider />}
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
