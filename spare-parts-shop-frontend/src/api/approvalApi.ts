import { api } from './client';

export interface ManagerApprovalRequest {
  id: number;
  type: string;
  payload: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  businessId: number;
  branchId: number;
  createdAt: string;
}

export const approvalApi = {
  getPendingApprovals: () => api.get<ManagerApprovalRequest[]>('/approvals/pending'),
  getAllApprovals: () => api.get<ManagerApprovalRequest[]>('/approvals'),
  requestApproval: (type: string, payload: any) => api.post<ManagerApprovalRequest>('/approvals/request', { type, payload }),
  approve: (id: number) => api.put(`/approvals/${id}/approve`, {}),
  reject: (id: number) => api.put(`/approvals/${id}/reject`, {}),
  checkStatus: (id: number) => api.get<ManagerApprovalRequest>(`/approvals/${id}`),
};
