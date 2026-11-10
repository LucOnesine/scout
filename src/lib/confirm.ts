import { Alert } from 'react-native';

export function confirmDelete(message: string, onConfirm: () => void) {
  Alert.alert('Supprimer', message, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: onConfirm },
  ]);
}
