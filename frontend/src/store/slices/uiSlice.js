import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    darkMode: localStorage.getItem('vendorlink_dark') === 'true',
    globalLoading: false,
    modal: { open: false, type: null, data: null },
  },
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen(state, action) { state.sidebarOpen = action.payload; },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('vendorlink_dark', state.darkMode);
      if (state.darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload;
      localStorage.setItem('vendorlink_dark', action.payload);
      if (action.payload) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    },
    setGlobalLoading(state, action) { state.globalLoading = action.payload; },
    openModal(state, action) { state.modal = { open: true, type: action.payload.type, data: action.payload.data || null }; },
    closeModal(state) { state.modal = { open: false, type: null, data: null }; },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleDarkMode, setDarkMode, setGlobalLoading, openModal, closeModal } = uiSlice.actions;
export const selectSidebarOpen = (s) => s.ui.sidebarOpen;
export const selectDarkMode = (s) => s.ui.darkMode;
export const selectModal = (s) => s.ui.modal;
export default uiSlice.reducer;
