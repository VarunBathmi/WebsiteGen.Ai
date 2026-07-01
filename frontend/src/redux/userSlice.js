
import { createSlice } from "@reduxjs/toolkit";

// const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     userData: null,
//     authLoading: true,
//   },
//   reducers: {
//     setUserData: (state, action) => {
//       state.userData = action.payload;
//       state.authLoading = false;
//     },
//     // Call this when the session check fails (unauthenticated) so
//     // ProtectedRoute knows it's safe to redirect.
//     clearUserData: (state) => {
//       state.userData = null;
//       state.authLoading = false;
//     },
//     setAuthLoading: (state, action) => {
//       state.authLoading = action.payload;
//     },
//   },
// });

// export const { setUserData, clearUserData, setAuthLoading } = userSlice.actions;

// export default userSlice.reducer;

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    authLoading: true, // authLoading is true initially to guard loading state
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.authLoading = false; // set loading to false on success
    },
    // Call this when the session check fails (unauthenticated) so
    // ProtectedRoute knows it's safe to redirect.
    clearUserData: (state) => {
      state.userData = null;
      state.authLoading = false; // set loading to false on failure
    },
    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
  },
});

export const { setUserData, clearUserData, setAuthLoading } = userSlice.actions;
 export default userSlice.reducer;