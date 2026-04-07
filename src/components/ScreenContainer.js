import { SafeAreaView, View } from 'react-native';
import { colors, spacing } from '../constants/theme';

export default function ScreenContainer({ children, maxWidth = 900, padded = true }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth,
          alignSelf: 'center',
          padding: padded ? spacing.md : 0,
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}