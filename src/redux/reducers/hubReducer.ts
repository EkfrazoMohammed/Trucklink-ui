import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


interface HubData {
  _id?: string;
  name: string;
  cityCode: string;
  district: string;
  state: string;
}

interface PostHubResponse {
  message: string;
  newHub: HubData;
}

interface FetchHubDataResponse {
  data: HubData[];
}


interface UpdateHubDataPayload {
  id: string;
}

// Async thunk action for fetching hub data
export const fetchHubData = createAsyncThunk("hub/fetchHubData", async () => {
  const response = await axios.get(
      "http://localhost:3006/api/hubs"
    );
  return (response as FetchHubDataResponse).data;
});

// Async thunk action for posting hub data
export const postHubData = createAsyncThunk(
  "hub/postHubData",
  async (hubData: HubData) => {
    const response = await axios.post<PostHubResponse>(
      "http://localhost:3006/api/hubs",
      hubData
    );
    return response.data;
  }
);

// Async thunk action for updating hub data
export const updateHubData = createAsyncThunk(
  "hub/updateHubData",
  async (hubData: UpdateHubDataPayload) => {
    const response = await axios.put(
      `https://trucklinkuatnew.thestorywallcafe.com/api/hubs/${hubData.id}`,
      hubData
    );
    return (response.data as HubData);
  }
);

const hubSlice = createSlice({
  name: "hub",
  initialState: {
    selectedHub: null as HubData | null,
    hubData: [] as HubData[],
    loading: false,
    error: null as string | null,
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
        state.error = action.error ? action.error.message ?? null : null;
      })
      // Reducers for posting hub data
      .addCase(postHubData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postHubData.fulfilled, (state, action) => {
        const newHubData: HubData = {
          _id: action.payload.newHub._id, // Assuming the server returns the newly generated id
          name: action.payload.newHub.name,
          cityCode: action.payload.newHub.cityCode,
          district: action.payload.newHub.district,
          state: action.payload.newHub.state,
        };
      
        state.hubData.push(newHubData);// Assuming the response is the newly added hub data
        state.loading = false;
        state.error = null;
      })
      
      .addCase(postHubData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error ? action.error.message ?? null : null;
      })
      // Reducers for updating hub data
      .addCase(updateHubData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHubData.fulfilled, (state, action) => {
        const updatedHubIndex = state.hubData.findIndex(
          (hub) => hub._id === action.payload._id
        );
        if (updatedHubIndex !== -1) {
          state.hubData[updatedHubIndex] = action.payload; // Assuming the response is the updated hub data
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateHubData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error ? action.error.message ?? null : null;
      });
      
  },
});

export default hubSlice.reducer;
export const { setSelectedHub } = hubSlice.actions; // Make sure to export setSelectedHub