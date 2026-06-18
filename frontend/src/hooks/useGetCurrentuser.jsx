import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData, clearUserData } from "../redux/userSlice";

/**
 * Runs once on mount. Restores the session from the HttpOnly cookie by
 * calling /api/user/me. On success it populates Redux; on failure (401)
 * it marks auth as resolved so ProtectedRoute can safely redirect instead
 * of staying in a loading loop.
 */
const useGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/user/me`, {
          withCredentials: true,
        });
        dispatch(setUserData(data));
      } catch {
        // Not authenticated — mark resolved so the UI can react correctly.
        dispatch(clearUserData());
      }
    };
    getCurrentUser();
  }, [dispatch]);
};

export default useGetCurrentUser;