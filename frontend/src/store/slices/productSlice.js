import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try { return await productService.getProducts(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try { return await productService.getProduct(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createProduct = createAsyncThunk('products/create', async (data, { rejectWithValue }) => {
  try { return await productService.createProduct(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }, { rejectWithValue }) => {
  try { return await productService.updateProduct(id, data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try { await productService.deleteProduct(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: { products: [], product: null, pagination: null, loading: false, error: null },
  reducers: { clearProduct(s) { s.product = null; } },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.loading = true; })
     .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.products = a.payload.data; s.pagination = a.payload.pagination; })
     .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(fetchProduct.fulfilled, (s, a) => { s.product = a.payload.data; })
     .addCase(createProduct.fulfilled, (s, a) => { s.products.unshift(a.payload.data); })
     .addCase(updateProduct.fulfilled, (s, a) => { s.products = s.products.map(p => p._id === a.payload.data._id ? a.payload.data : p); })
     .addCase(deleteProduct.fulfilled, (s, a) => { s.products = s.products.filter(p => p._id !== a.payload); });
  },
});

export const { clearProduct } = productSlice.actions;
export const selectProducts = (s) => s.products.products;
export const selectProduct = (s) => s.products.product;
export const selectProductLoading = (s) => s.products.loading;
export const selectProductPagination = (s) => s.products.pagination;
export default productSlice.reducer;
