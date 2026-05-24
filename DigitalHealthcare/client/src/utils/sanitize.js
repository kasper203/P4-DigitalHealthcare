

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};


export const sanitizeUserInput = (text) => {
  if (!text) return '';
  return sanitizeString(text);
};

export default {
  sanitizeString,
  sanitizeUserInput
};
