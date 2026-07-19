import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';

export const fetchPayments = createAsyncThunk('payments/fetchAll', async (params, { rejectWithValue }) => {
  try { return await paymentService.getPayments(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchPayment = createAsyncThunk('payments/fetchOne', async (id, { rejectWithValue }) => {
  try { return await paymentService.getPayment(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createPayment = createAsyncThunk('payments/create', async (data, { rejectWithValue }) => {
  try { return await paymentService.createPayment(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updatePaymentStatus = createAsyncThunk('payments/updateStatus', async ({ id, ...data }, { rejectWithValue }) => {
  try { return await paymentService.updatePaymentStatus(id, data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchMyPayments = createAsyncThunk('payments/fetchMyPayments', async (params, { rejectWithValue }) => {
  try { return await paymentService.getMyPayments(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const paymentSlice = createSlice({
  name: 'payments',
  initialState: { payments: [], payment: null, pagination: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPayments.pending, (s) => { s.loading = true; })
     .addCase(fetchPayments.fulfilled, (s, a) => { s.loading = false; s.payments = a.payload.data; s.pagination = a.payload.pagination; })
     .addCase(fetchPayments.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(fetchMyPayments.fulfilled, (s, a) => { s.payments = a.payload.data; s.pagination = a.payload.pagination; })
     .addCase(fetchPayment.fulfilled, (s, a) => { s.payment = a.payload.data; })
     .addCase(createPayment.fulfilled, (s, a) => { s.payments.unshift(a.payload.data); })
     .addCase(updatePaymentStatus.fulfilled, (s, a) => {
       s.payments = s.payments.map(p => p._id === a.payload.data._id ? a.payload.data : p);
     });
  },
});

export const selectPayments = (s) => s.payments.payments;
export const selectPayment = (s) => s.payments.payment;
export const selectPaymentLoading = (s) => s.payments.loading;
export const selectPaymentPagination = (s) => s.payments.pagination;
export default paymentSlice.reducer;
