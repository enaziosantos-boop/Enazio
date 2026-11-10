import { Response } from 'express';

// Active SSE client connections
const clients = new Set<Response>();

export function addClient(res: Response) {
  clients.add(res);
  res.on('close', () => {
    clients.delete(res);
  });
}

export function broadcastEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

export function getConnectedClientsCount() {
  return clients.size;
}
