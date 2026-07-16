import { api } from './client';

export interface Shift {
  id: number;
  userId: number;
  businessId: number;
  branchId: number;
  startTime: string;
  endTime?: string;
  openingCash: number;
  closingCash?: number;
  status: string;
}

export const shiftApi = {
  getCurrentShift: () => api.get<Shift>('/shifts/current'),
  openShift: (openingCash: number) => api.post<Shift>('/shifts/open', { openingCash }),
  closeShift: (closingCash: number) => api.post<Shift>('/shifts/close', { closingCash }),
  getShiftReport: (shiftId: number) => api.get<any>(`/shifts/${shiftId}/report`),
};
