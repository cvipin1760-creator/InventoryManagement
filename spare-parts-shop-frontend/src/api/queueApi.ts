import { api } from './client';

export interface QueueEntry {
  id: number;
  customerName: string;
  phoneNumber?: string;
  joinTime: string;
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';
  businessId: number;
  branchId: number;
  tokenNumber: string;
}

export interface Counter {
  id: number;
  name: string;
  status: 'OPEN' | 'CLOSED';
  currentEntry?: QueueEntry;
  businessId: number;
  branchId: number;
}

export const queueApi = {
  getCounters: () => api.get<Counter[]>('/queue/counters'),
  openCounter: (name: string) => api.post<Counter>(`/queue/counters?name=${name}`, {}),
  closeCounter: (id: number) => api.put<Counter>(`/queue/counters/${id}/close`, {}),
  getQueue: (counterId: number) => api.get<QueueEntry[]>(`/queue/counters/${counterId}/queue`),
  addCustomerToQueue: (counterId: number, data: { customerName: string; phoneNumber?: string }) => 
    api.post<QueueEntry>(`/queue/counters/${counterId}/join`, data),
  serveCustomer: (counterId: number, entryId: number) => 
    api.put<QueueEntry>(`/queue/counters/${counterId}/serve/${entryId}`, {}),
};
