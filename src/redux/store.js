import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers'; // Adjust this if necessary

const store = configureStore({
  reducer: {
    user: userReducer, // Bringing in the user slice reducer
  },
});

export default store;