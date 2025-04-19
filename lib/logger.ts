export const log = (label: string, data?: any) => {
  console.log(`[${new Date().toISOString()}] ${label}`, data || '');
};
