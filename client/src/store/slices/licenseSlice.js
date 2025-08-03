import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  licenses: [],
  loading: false,
  error: null,
};

const licenseSlice = createSlice({
  name: 'licenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = licenseSlice.actions;
export default licenseSlice.reducer; 