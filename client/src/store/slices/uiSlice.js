import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { toggleSidebar, setLoading } = uiSlice.actions;
export default uiSlice.reducer; 