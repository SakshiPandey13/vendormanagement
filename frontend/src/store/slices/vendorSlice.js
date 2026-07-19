import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vendorService from '../../services/vendorService';

export const fetchVendors = createAsyncThunk('vendors/fetchAll', async (params, { rejectWithValue }) => {
  try { return await vendorService.getVendors(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchVendor = createAsyncThunk('vendors/fetchOne', async (id, { rejectWithValue }) => {
  try { return await vendorService.getVendor(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createVendor = createAsyncThunk('vendors/create', async (data, { rejectWithValue }) => {
  try { return await vendorService.createVendor(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateVendor = createAsyncThunk('vendors/update', async ({ id, data }, { rejectWithValue }) => {
  try { return await vendorService.updateVendor(id, data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const deleteVendor = createAsyncThunk('vendors/delete', async (id, { rejectWithValue }) => {
  try { await vendorService.deleteVendor(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const vendorSlice = createSlice({
  name: 'vendors',
  initialState: {
    vendors: [], vendor: null, pagination: null,
    loading: false, error: null,
  },
  reducers: {
    clearVendor(state) { state.vendor = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (s) => { s.loading = true; s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };

    builder
      .addCase(fetchVendors.pending, pending)
      .addCase(fetchVendors.fulfilled, (s, a) => {
        s.loading = false; s.vendors = a.payload.data; s.pagination = a.payload.pagination;
      })
      .addCase(fetchVendors.rejected, rejected)
      .addCase(fetchVendor.pending, pending)
      .addCase(fetchVendor.fulfilled, (s, a) => { s.loading = false; s.vendor = a.payload.data; })
      .addCase(fetchVendor.rejected, rejected)
      .addCase(createVendor.fulfilled, (s, a) => { s.vendors.unshift(a.payload.data); })
      .addCase(updateVendor.fulfilled, (s, a) => {
        s.vendors = s.vendors.map(v => v._id === a.payload.data._id ? a.payload.data : v);
        if (s.vendor?._id === a.payload.data._id) s.vendor = a.payload.data;
      })
      .addCase(deleteVendor.fulfilled, (s, a) => { s.vendors = s.vendors.filter(v => v._id !== a.payload); });
  },
});

export const { clearVendor, clearError } = vendorSlice.actions;
export const selectVendors = (s) => s.vendors.vendors;
export const selectVendor = (s) => s.vendors.vendor;
export const selectVendorPagination = (s) => s.vendors.pagination;
export const selectVendorLoading = (s) => s.vendors.loading;
export default vendorSlice.reducer;
