import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (params, { rejectWithValue }) => {
  try { return await orderService.getOrders(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { return await orderService.getOrder(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try { return await orderService.createOrder(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status, note }, { rejectWithValue }) => {
  try { return await orderService.updateOrderStatus(id, { status, note }); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (params, { rejectWithValue }) => {
  try { return await orderService.getMyOrders(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders: [], order: null, pagination: null, loading: false, error: null },
  reducers: { clearOrder(s) { s.order = null; } },
  extraReducers: (b) => {
    b.addCase(fetchOrders.pending, (s) => { s.loading = true; })
     .addCase(fetchOrders.fulfilled, (s, a) => { s.loading = false; s.orders = a.payload.data; s.pagination = a.payload.pagination; })
     .addCase(fetchOrders.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(fetchMyOrders.fulfilled, (s, a) => { s.orders = a.payload.data; s.pagination = a.payload.pagination; })
     .addCase(fetchOrder.fulfilled, (s, a) => { s.order = a.payload.data; })
     .addCase(createOrder.fulfilled, (s, a) => { s.orders.unshift(a.payload.data); })
     .addCase(updateOrderStatus.fulfilled, (s, a) => {
       s.orders = s.orders.map(o => o._id === a.payload.data._id ? a.payload.data : o);
       if (s.order?._id === a.payload.data._id) s.order = a.payload.data;
     });
  },
});

export const { clearOrder } = orderSlice.actions;
export const selectOrders = (s) => s.orders.orders;
export const selectOrder = (s) => s.orders.order;
export const selectOrderLoading = (s) => s.orders.loading;
export const selectOrderPagination = (s) => s.orders.pagination;
export default orderSlice.reducer;
