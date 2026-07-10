import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const useInventorySocket = (businessId?: number) => {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only connect if we have a businessId or default to a generic URL for single-tenant
    const wsUrl = `wss://inventorymanagement-afhl.onrender.com/ws/inventory`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Connected to Inventory WebSocket');
      setIsConnected(true);
      
      // If the backend requires a businessId to register the session:
      if (businessId) {
        socket.send(JSON.stringify({ type: 'REGISTER', businessId }));
      } else {
        // Default to businessId 1 for now if single tenant
        socket.send(JSON.stringify({ type: 'REGISTER', businessId: 1 }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Live Inventory Update:', data);
        
        toast.success(`Live Stock Update: ${data.productName || 'Product'} changed to ${data.quantity || data.newQuantity || 'new amount'}`);
        
        // Invalidate React Query caches to trigger a live re-fetch
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      } catch (e) {
        console.error('Failed to parse websocket message', e);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from Inventory WebSocket');
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [businessId, queryClient]);

  return { isConnected };
};
