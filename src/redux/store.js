import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'; // adjust the path based on your folder structure

const store = configureStore({
  reducer: {
    auth: authReducer,
    // add more slices here
  },
});

export default store;
