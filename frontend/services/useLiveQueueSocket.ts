'use client';

import { useEffect, useState } from 'react';
import { queueWebSocket, LiveQueueBoardData } from './websocketService';

export function useLiveQueueSocket(salonId?: string, onUpdate?: (data: LiveQueueBoardData) => void) {
  const [liveData, setLiveData] = useState<LiveQueueBoardData | null>(null);

  useEffect(() => {
    if (!salonId) return;

    const unsubscribe = queueWebSocket.subscribeToSalon(salonId, (data) => {
      setLiveData(data);
      if (onUpdate) {
        onUpdate(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [salonId, onUpdate]);

  return liveData;
}
