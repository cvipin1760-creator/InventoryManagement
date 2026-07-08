import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

export const useInventoryWebSocket = () => {
  const user = useAppSelector(selectCurrentUser);
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user || !user.businessId) return;

    const connect = () => {
      // In production (Vercel), point WebSockets directly to the Render backend to avoid proxy timeouts.
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const wsUrl = import.meta.env.VITE_WS_URL 
        ? import.meta.env.VITE_WS_URL
        : isLocalhost 
            ? `ws://localhost:8080/ws/inventory`
            : `wss://inventorymanagement-afhl.onrender.com/ws/inventory`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Connected to Inventory WebSocket');
        ws.current?.send(JSON.stringify({ action: 'subscribe', businessId: user.businessId }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INVENTORY_UPDATE') {
            console.log('Received inventory update via WebSocket:', data.product);
            // Invalidate the 'products' query to trigger a refetch everywhere it's used
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Could also directly update the cache here for better performance if we wanted to
          }
        } catch (err) {
          console.error('Error parsing websocket message', err);
        }
      };

      ws.current.onclose = () => {
        console.log('Inventory WebSocket closed. Reconnecting in 5 seconds...');
        setTimeout(connect, 5000);
      };

      ws.current.onerror = (err) => {
        console.error('Inventory WebSocket error:', err);
        ws.current?.close();
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null; // Prevent auto-reconnect on unmount
        ws.current.close();
      }
    };
  }, [user, queryClient]);
};
