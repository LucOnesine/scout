import { registerRootComponent } from 'expo';

if (process.env.EXPO_PUBLIC_ADMIN === '1') {
  const { default: AdminApp } = require('./src/admin/AdminApp');
  registerRootComponent(AdminApp);
} else {
  require('expo-router/entry');
}
