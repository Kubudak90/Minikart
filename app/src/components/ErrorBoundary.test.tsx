import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

// AsyncStorage native modülü test ortamında yok; resmi in-memory mock'u kullan.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { ErrorBoundary } from './ErrorBoundary';

const Boom = (): React.ReactNode => {
  throw new Error('patlama');
};

describe('ErrorBoundary', () => {
  test('alt bileşen hata fırlatınca kurtarma ekranı gösterir', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(getByText('Bir şeyler ters gitti')).toBeTruthy();
    expect(getByText('Uygulamayı sıfırla')).toBeTruthy();
    spy.mockRestore();
  });

  test('hata yoksa çocukları olduğu gibi gösterir', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>içerik</Text>
      </ErrorBoundary>,
    );
    expect(getByText('içerik')).toBeTruthy();
  });
});
