export const parseApiError = (err) => {
  if (err?.response?.data) {
    if (typeof err.response.data === 'string') return err.response.data;
    if (err.response.data.detail) return err.response.data.detail;

    const flattenErrors = (obj, prefix = '') => {
      let result = [];
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

    const errors = flattenErrors(err.response.data);
    if (errors.length > 0) return errors.join('\n');
  }
  return err?.message || 'An error occurred while processing the request.';
};
