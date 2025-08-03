import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  routes: [],
  loading: false,
  error: null,
};

const transportSlice = createSlice({
  name: 'transport',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = transportSlice.actions;
export default transportSlice.reducer; 