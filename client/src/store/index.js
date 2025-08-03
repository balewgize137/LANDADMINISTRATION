import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import vehicleSlice from './slices/vehicleSlice';
import licenseSlice from './slices/licenseSlice';
import transportSlice from './slices/transportSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    vehicles: vehicleSlice,
    licenses: licenseSlice,
    transport: transportSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 