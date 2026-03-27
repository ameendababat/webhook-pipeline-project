

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    initialDelay: number;
    backoffFactor?: number;
  }
): Promise<T> => {
  const { maxRetries, initialDelay, backoffFactor = 2 } = options;
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = initialDelay * Math.pow(backoffFactor, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};