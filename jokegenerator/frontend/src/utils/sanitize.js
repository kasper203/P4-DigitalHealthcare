/**
 * Sanitize utility to prevent XSS attacks
 * Removes potentially dangerous HTML/script content
 */

export const sanitizeHTML = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

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

/**
 * Safely display user-generated content
 * @param {string} text - Text to sanitize
 * @returns {string} - Safe text for display
 */
export const sanitizeUserInput = (text) => {
  if (!text) return '';
  return sanitizeString(text);
};

export default {
  sanitizeHTML,
  sanitizeString,
  sanitizeUserInput
};
