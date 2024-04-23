import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk action for fetching hub data
export const fetchHubData = createAsyncThunk(
  'hub/fetchHubData',
  async () => {
    const response = await axios.get('http://localhost:3006/hubs');
    return response.data;
  }
);

// Async thunk action for posting hub data
export const postHubData = createAsyncThunk(
  'hub/postHubData',
  async (hubData) => {
    const response = await axios.post('http://localhost:3006/hubs', hubData);
    return response.data;
  }
);

// Async thunk action for updating hub data
export const updateHubData = createAsyncThunk(
  'hub/updateHubData',
  async (hubData) => {
    const response = await axios.put(`http://localhost:3006/hubs/${hubData.id}`, hubData);
    return response.data;
  }
);

const hubSlice = createSlice({
  name: 'hub',
  initialState: {
    selectedHub: null,
    hubData: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedHub: (state, action) => {
      state.selectedHub = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Reducers for fetching hub data
      .addCase(fetchHubData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHubData.fulfilled, (state, action) => {
        state.hubData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchHubData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Reducers for posting hub data
      .addCase(postHubData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postHubData.fulfilled, (state, action) => {
        state.hubData.push(action.payload); // Assuming the response is the newly added hub data
        state.loading = false;
        state.error = null;
      })
      .addCase(postHubData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Reducers for updating hub data
      .addCase(updateHubData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHubData.fulfilled, (state, action) => {
        const updatedHubIndex = state.hubData.findIndex(hub => hub.id === action.payload.id);
        if (updatedHubIndex !== -1) {
          state.hubData[updatedHubIndex] = action.payload; // Assuming the response is the updated hub data
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateHubData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default hubSlice.reducer;
export const { setSelectedHub } = hubSlice.actions; // Make sure to export setSelectedHub
