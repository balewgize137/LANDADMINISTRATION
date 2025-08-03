import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vehicles: [],
  loading: false,
  error: null,
};

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = vehicleSlice.actions;
export default vehicleSlice.reducer; 