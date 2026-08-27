/**
 * E.164 Phone Number Formatter & Validator
 * Designed for automatic shipping label generation (Gelato, Bring, Posten, Helthjem, DHL).
 */

/**
 * Formats a phone number to standard E.164 format (+[country code][number]).
 * Defaults to Norway (+47) for 8-digit numbers without country prefix.
 *
 * Examples:
 * - "91234567" -> "+4791234567"
 * - "412 34 567" -> "+4741234567"
 * - "+47 91 23 45 67" -> "+4791234567"
 * - "0047 91234567" -> "+4791234567"
 * - "4791234567" -> "+4791234567"
 * - "+46 70 123 45 67" -> "+46701234567"
 * - "" / null / undefined -> ""
 *
 * @param {string|number} phoneNumber - The raw phone number input
 * @param {string} defaultCountry - The fallback country code (default: 'NO' / '+47')
 * @returns {string} E.164 formatted phone number or empty string
 */
export function formatE164Phone(phoneNumber, defaultCountry = 'NO') {
  if (phoneNumber === null || phoneNumber === undefined) {
    return '';
  }

  let cleaned = String(phoneNumber).trim();
  if (!cleaned) return '';

  // Remove common formatting characters: spaces, dashes, dots, parentheses, slashes
  cleaned = cleaned.replace(/[\s\-\.\(\)\/]/g, '');

  // Convert international prefix 00 to + (e.g. 0047 -> +47, 0046 -> +46)
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If already starts with '+', ensure all remaining characters are digits
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.slice(1).replace(/\D/g, '');
    return digitsOnly ? `+${digitsOnly}` : '';
  }

  // Strip any non-digit characters
  const digits = cleaned.replace(/\D/g, '');
  if (!digits) return '';

  // Handle Norwegian Numbers (defaultCountry === 'NO')
  if (defaultCountry === 'NO') {
    // 8-digit Norwegian numbers (starting with 4, 9, 2, 3, 5, 6, 7, 8)
    if (digits.length === 8) {
      return `+47${digits}`;
    }

    // 10-digit numbers starting with 47 followed by 8 digits
    if (digits.length === 10 && digits.startsWith('47')) {
      return `+${digits}`;
    }
  }

  // Handle Swedish Numbers (defaultCountry === 'SE')
  if (defaultCountry === 'SE') {
    if (digits.startsWith('0') && digits.length >= 8) {
      return `+46${digits.slice(1)}`;
    }
    if (digits.startsWith('46') && digits.length >= 9) {
      return `+${digits}`;
    }
  }

  // Handle Danish Numbers (defaultCountry === 'DK')
  if (defaultCountry === 'DK') {
    if (digits.length === 8) {
      return `+45${digits}`;
    }
    if (digits.startsWith('45') && digits.length === 10) {
      return `+${digits}`;
    }
  }

  // Fallback for 8-digit generic Scandinavian / Norwegian input
  if (digits.length === 8) {
    return `+47${digits}`;
  }

  // If already starts with a country code like 47XXXXXXXX, prepend +
  if (digits.length >= 10 && digits.startsWith('47')) {
    return `+${digits}`;
  }

  // Generic fallback: prepend + if valid length for international format, otherwise return digits with +47 if 8 digits
  return `+${digits}`;
}

/**
 * Validates whether a phone number is a valid Norwegian mobile/landline number.
 *
 * @param {string|number} phoneNumber
 * @returns {boolean}
 */
export function isValidNorwegianPhone(phoneNumber) {
  const formatted = formatE164Phone(phoneNumber, 'NO');
  // Norwegian E.164 format: +47 followed by exactly 8 digits
  return /^\+47[2-9]\d{7}$/.test(formatted);
}

/**
 * Validates whether a string adheres to the standard E.164 format (+[1-9][0-9]{6,14}).
 *
 * @param {string} phoneNumber
 * @returns {boolean}
 */
export function isValidE164Phone(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  return /^\+[1-9]\d{6,14}$/.test(phoneNumber);
}
