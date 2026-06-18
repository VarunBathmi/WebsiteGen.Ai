// const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     userData: null,
//   },
//   reducers: {
//     setUserData: (state, action) => {
//       state.userData = action.payload;
//     },
//   },
// });

// export const { setUserData } = userSlice.actions;

// export default userSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    // authResolved: false means the /api/user/me call has not completed yet.
    // ProtectedRoute waits for this before deciding to redirect, which
    // eliminates the "route flicker" where an authenticated user briefly
    // sees the Home page on a hard refresh.
    authResolved: false,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.authResolved = true;
    },
    // Call this when the session check fails (unauthenticated) so
    // ProtectedRoute knows it's safe to redirect.
    clearUserData: (state) => {
      state.userData = null;
      state.authResolved = true;
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;

export default userSlice.reducer;