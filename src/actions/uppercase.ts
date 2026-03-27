

export const uppercaseAction = async (payload: any): Promise<any> => {
  if (typeof payload === 'string') {
    return payload.toUpperCase();
  }
  
  if (typeof payload === 'object' && payload !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'string') {
        result[key] = value.toUpperCase();
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  
  return payload;
};