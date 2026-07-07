import apiClient from './index';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface VerifyOtpCredentials {
  email: string;
  otp: string;
}

export interface LoginResponse {
  userId?: number;
  username: string;
  role: string;
  businessId?: number;
  branchId?: number;
  mustChangePassword?: boolean;
  features?: {
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
  };
  token?: string;
  message: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<void> => {
    await apiClient.post('/auth/register', credentials);
  },

  verifyOtp: async (data: VerifyOtpCredentials): Promise<void> => {
    await apiClient.post('/auth/verify-otp', data);
  },

  resendOtp: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-otp', { email });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  loginWithGoogle: async (idToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/google', { idToken });
    return response.data;
  },

  changePassword: async (newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', { newPassword });
  },
};
