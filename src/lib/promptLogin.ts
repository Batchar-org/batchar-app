import { Alert } from 'react-native';
import { router } from 'expo-router';

export function promptLogin(message = '로그인이 필요한 기능이에요.') {
  Alert.alert('로그인 필요', message, [
    { text: '취소', style: 'cancel' },
    { text: '로그인', onPress: () => router.replace('/login') },
  ]);
}
