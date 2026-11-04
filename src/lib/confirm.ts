import { Alert, Platform } from 'react-native';

export function confirmDelete(message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(message)) {
      onConfirm();
    }
    return;
  }

  Alert.alert('Supprimer', message, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: onConfirm },
  ]);
}
