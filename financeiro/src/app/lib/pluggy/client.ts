import { PluggyClient } from 'pluggy-sdk';

let pluggyClientInstance: PluggyClient | null = null;

export const getPluggyClient = (): PluggyClient => {
  const clientId = process.env.PLUGGY_CLIENT_ID || 'placeholder-pluggy-client-id';
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET || 'placeholder-pluggy-client-secret';

  if (!pluggyClientInstance) {
    pluggyClientInstance = new PluggyClient({
      clientId,
      clientSecret,
    });
  }
  return pluggyClientInstance;
};