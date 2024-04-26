import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
interface OnboardingState {
  ownerData: [];
  truckMasterData: [];
  loading: {
    owner: boolean;
    updateOwner: boolean; // Assuming you want to track loading for updating owner data
    truckMaster: boolean;
  };
  error: {
    owner: string | undefined;
    updateOwner: string | null; // Assuming you want to track error for updating owner data
    truckMaster: string | null;
  };
}

// Async thunk action for fetching owner data
export const fetchOwnerData = createAsyncThunk(
  "onboarding/fetchOwnerData",
  async () => {
    const response = await axios.get(
      "https://trucklinkuatnew.thestorywallcafe.com/api/owner"
    );
    console.log(response);
    return response.data;
  }
);

// Async thunk action for updating owner data
export const addOwnerDataAccount = createAsyncThunk(
  "onboarding/addOwnerDataAccount",
  async (formData) => {
    const response = await axios.post(
      "https://trucklinkuatnew.thestorywallcafe.com/api/owner/owner-account",
      formData
    );
    return response.data;
  }
);

// Async thunk action for fetching truck master data
export const fetchTruckMasterData = createAsyncThunk(
  "onboarding/fetchTruckMasterData",
  async () => {
    const response = await axios.get(
      "https://trucklinkuatnew.thestorywallcafe.com/api/truckmaster"
    );
    return response.data;
  }
);
const initialState: OnboardingState = {
  ownerData: [],
  truckMasterData: [],
  loading: {
    owner: false,
    updateOwner: false,
    truckMaster: false,
  },
  error: {
    owner: "",
    updateOwner: "",
    truckMaster: "",
  },
};
const onboardingSlice = createSlice({
  name: "onboarding",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Reducers for owner data
      .addCase(fetchOwnerData.pending, (state) => {
        console.log(state)
        state.loading.owner = true;
        state.error.owner = "";
      })
      .addCase(fetchOwnerData.fulfilled, (state, action) => {
        console.log(action)
        state.ownerData = action.payload;
        state.loading.owner = false;
        state.error.owner = "";
      })
      .addCase(fetchOwnerData.rejected, (state, action) => {
        console.log(action)
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
  },
});

export default onboardingSlice.reducer;
