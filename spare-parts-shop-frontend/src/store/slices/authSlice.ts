import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'SUPER_MANAGER' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  businessId?: number;
  permissions?: string[];
  configuration?: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  configuration: any | null;
  token?: string | null;
}

const initialState: AuthState = (() => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  return {
    isAuthenticated: !!token && !!user,
    user,
    configuration: user?.configuration || null,
    token,
  };
})();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state: AuthState,
      action: PayloadAction<{
        user: User;
        configuration?: any;
        token?: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.configuration = action.payload.configuration || null;
      state.token = action.payload.token;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      localStorage.setItem('user', JSON.stringify({ ...action.payload.user, configuration: action.payload.configuration }));
    },
    logout: (state: AuthState) => {
      state.isAuthenticated = false;
      state.user = null;
      state.configuration = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectConfiguration = (state: RootState) => state.auth.configuration;
export default authSlice.reducer;
