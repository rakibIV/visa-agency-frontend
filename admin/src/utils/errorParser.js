export const parseApiError = (err) => {
  if (err?.response?.data) {
    if (typeof err.response.data === 'string') return err.response.data;
    if (err.response.data.detail) return err.response.data.detail;
    
    const errors = [];
    for (const [field, messages] of Object.entries(err.response.data)) {
      if (Array.isArray(messages)) {
        errors.push(`${field.toUpperCase()}: ${messages.join(', ')}`);
      } else if (typeof messages === 'string') {
        errors.push(`${field.toUpperCase()}: ${messages}`);
      }
    }
    if (errors.length > 0) return errors.join('\n');
  }
  return err?.message || 'An error occurred while processing the request.';
};
