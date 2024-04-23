import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk action for fetching owner data
export const fetchOwnerData = createAsyncThunk(
  'onboarding/fetchOwnerData',
  async () => {

      const response = await axios.get('http://localhost:3006/owner');
      return response.data;
  }
);

// Async thunk action for updating owner data
export const addOwnerDataAccount = createAsyncThunk(
  'onboarding/addOwnerDataAccount',
  async (formData) => {
    const response = await axios.post('http://localhost:3006/owner/owner-account', formData);
    return response.data;
  }
);

// Async thunk action for fetching truck master data
export const fetchTruckMasterData = createAsyncThunk(
  'onboarding/fetchTruckMasterData',
  async () => {
      const response = await axios.get('http://localhost:3006/truckmaster');
      return response.data;
   }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: {
    ownerData: [],
    truckMasterData: [],
    loading: {
      owner: false,
      truckMaster: false,
    },
    error: {
      owner: null,
      truckMaster: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Reducers for owner data
      .addCase(fetchOwnerData.pending, (state) => {
        state.loading.owner = true;
        state.error.owner = null;
      })
      .addCase(fetchOwnerData.fulfilled, (state, action) => {
        state.ownerData = action.payload;
        state.loading.owner = false;
        state.error.owner = null;
      })
      .addCase(fetchOwnerData.rejected, (state, action) => {
        state.loading.owner = false;
        state.error.owner = action.error.message;
      })
      // Reducers for updating owner data
      .addCase(addOwnerDataAccount.pending, (state) => {
        state.loading.updateOwner = true;
        state.error.updateOwner = null;
      })
      .addCase(addOwnerDataAccount.fulfilled, (state, action) => {
        state.loading.updateOwner = false;
        state.error.updateOwner = null;
        // Optionally, you can update the state after successful update
        state.ownerData = action.payload; // Update owner data with the response from the server
      })
      .addCase(addOwnerDataAccount.rejected, (state, action) => {
        state.loading.updateOwner = false;
        state.error.updateOwner = action.error.message;
      })

      // Reducers for truck master data
      .addCase(fetchTruckMasterData.pending, (state) => {
        state.loading.truckMaster = true;
        state.error.truckMaster = null;
      })
      .addCase(fetchTruckMasterData.fulfilled, (state, action) => {
        state.truckMasterData = action.payload;
        state.loading.truckMaster = false;
        state.error.truckMaster = null;
      })
      .addCase(fetchTruckMasterData.rejected, (state, action) => {
        state.loading.truckMaster = false;
        state.error.truckMaster = action.error.message;
      })
  },
});

export default onboardingSlice.reducer;
