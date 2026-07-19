import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Load user from localStorage
const token = localStorage.getItem('vendorlink_token');
const user = localStorage.getItem('vendorlink_user')
  ? JSON.parse(localStorage.getItem('vendorlink_user'))
  : null;

// ─── Async Thunks ─────────────────────────────────────────
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.login(credentials);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    return await authService.register(data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    return await authService.getMe();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    return await authService.forgotPassword(email);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    return await authService.resetPassword(token, password);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    return await authService.updateProfile(data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

// ─── Slice ────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,
    token,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('vendorlink_token');
      localStorage.removeItem('vendorlink_user');
    },
    clearError(state) {
      state.error = null;
    },
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('vendorlink_token', action.payload.token);
        localStorage.setItem('vendorlink_user', JSON.stringify(action.payload.data));
      })
      .addCase(login.rejected, handleRejected)

      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('vendorlink_token', action.payload.token);
        localStorage.setItem('vendorlink_user', JSON.stringify(action.payload.data));
      })
      .addCase(register.rejected, handleRejected)

      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.data;
        localStorage.setItem('vendorlink_user', JSON.stringify(action.payload.data));
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload.data };
        localStorage.setItem('vendorlink_user', JSON.stringify(state.user));
      })

      .addCase(forgotPassword.pending, handlePending)
      .addCase(forgotPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(forgotPassword.rejected, handleRejected)

      .addCase(resetPassword.pending, handlePending)
      .addCase(resetPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(resetPassword.rejected, handleRejected);
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
