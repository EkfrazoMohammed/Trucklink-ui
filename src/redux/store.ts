import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>; // Define RootState type based on the state of the store
export type AppDispatch = typeof store.dispatch; // Define AppDispatch type based on the dispatch function of the store

export default store;
