import { View, Text, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function LoadingDialog({ loading = false, message = "Loading..." }) {
  const { theme } = useTheme();

  if (!loading) return null;

  return (
    <Modal transparent visible={loading} animationType="fade">
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.overlay,
      }}>
        <View style={{
          padding: 20,
          borderRadius: 15,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
        }}>
          <ActivityIndicator size={'large'} color={theme.colors.white} />
          <Text style={{
            color: theme.colors.white,
            fontSize: 18,
            marginTop: 10,
          }}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}