

export const addTimestampAction = async (payload: any): Promise<any> => {
  const timestamp = new Date().toISOString();
  
  if (typeof payload === 'object' && payload !== null) {
    return {
      ...payload,
      processed_at: timestamp,
      received_at: payload.received_at || timestamp,
    };
  }
  
  return {
    original: payload,
    processed_at: timestamp,
    received_at: timestamp,
  };
};