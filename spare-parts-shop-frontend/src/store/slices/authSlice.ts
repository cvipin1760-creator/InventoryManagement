import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  businessId?: number;
  permissions?: string[];
  features?: any;
}

export interface FeaturePermissions {
  inventoryEnabled: boolean;
  billingEnabled: boolean;
  warrantyEnabled: boolean;
  emiEnabled: boolean;
  gstEnabled: boolean;
  customerPortalEnabled: boolean;
  reportsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  multiUserSupportEnabled: boolean;
  employeeManagementEnabled: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  features: FeaturePermissions | null;
  token?: string | null;
}

const initialState: AuthState = (() => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  return {
    isAuthenticated: !!token && !!user,
    user,
    features: null,
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
        features?: FeaturePermissions;
        token?: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.features = action.payload.features || null;
      state.token = action.payload.token;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state: AuthState) => {
      state.isAuthenticated = false;
      state.user = null;
      state.features = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectFeatures = (state: RootState) => state.auth.features;
export default authSlice.reducer;
