import { io } from 'socket.io-client';

const endpoint = import.meta.env.SNOWPACK_PUBLIC_API_URL!;

export const socket = io(endpoint, { transports: ['websocket', 'polling'] });

export const reconnect = (): void => {
  socket.disconnect();
  socket.connect();
};

import.meta.env.NODE_ENV === 'development' &&
  socket.onAny((event, ...args) => {
    if (event === 'error') {
      console.error(args[0].error);
    } else {
      console.log(`<-- ${event}`);
      console.log(args);
    }
  });
