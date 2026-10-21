export const parseApiError = (err) => {
  if (err?.response?.data) {
    const data = err.response.data;

    if (typeof data === 'string') {
      const trimmed = data.trim();
      if (trimmed.startsWith('<') || trimmed.includes('<html') || trimmed.includes('<!DOCTYPE')) {
        return `Server Error (${err.response.status || 500}): An internal server error occurred. Please check backend logs or try again.`;
      }
      return trimmed;
    }

    if (data.detail && typeof data.detail === 'string') {
      return data.detail;
    }

    if (typeof data === 'object' && data !== null) {
      const flattenErrors = (obj, prefix = '') => {
        let result = [];
        if (!obj || typeof obj !== 'object') return result;
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (Array.isArray(value)) {
            result.push(`${fullKey.toUpperCase()}: ${value.join(', ')}`);
          } else if (typeof value === 'object' && value !== null) {
            result = result.concat(flattenErrors(value, fullKey));
          } else if (typeof value === 'string') {
            result.push(`${fullKey.toUpperCase()}: ${value}`);
          }
        }
        return result;
      };

      const errors = flattenErrors(data);
      if (errors.length > 0) return errors.join('\n');
    }
  }

  return err?.message || 'An error occurred while processing the request.';
};

