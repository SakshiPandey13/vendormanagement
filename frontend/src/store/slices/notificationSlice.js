import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (params, { rejectWithValue }) => {
  try { return await notificationService.getNotifications(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchUnreadCount = createAsyncThunk('notifications/unreadCount', async (_, { rejectWithValue }) => {
  try { return await notificationService.getUnreadCount(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try { return await notificationService.markAsRead(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try { return await notificationService.markAllAsRead(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { notifications: [], unreadCount: 0, pagination: null, loading: false },
  reducers: {
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchNotifications.fulfilled, (s, a) => {
       s.notifications = a.payload.data?.notifications || [];
       s.unreadCount = a.payload.data?.unreadCount || 0;
       s.pagination = a.payload.pagination;
     })
     .addCase(fetchUnreadCount.fulfilled, (s, a) => { s.unreadCount = a.payload.data?.count || 0; })
     .addCase(markAsRead.fulfilled, (s, a) => {
       s.notifications = s.notifications.map(n => n._id === a.payload.data._id ? { ...n, isRead: true } : n);
       s.unreadCount = Math.max(0, s.unreadCount - 1);
     })
     .addCase(markAllAsRead.fulfilled, (s) => {
       s.notifications = s.notifications.map(n => ({ ...n, isRead: true }));
       s.unreadCount = 0;
     });
  },
});

export const { addNotification } = notificationSlice.actions;
export const selectNotifications = (s) => s.notifications.notifications;
export const selectUnreadCount = (s) => s.notifications.unreadCount;
export default notificationSlice.reducer;
