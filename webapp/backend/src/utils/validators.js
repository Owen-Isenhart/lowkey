const { ValidationError } = require('./errors');

// Input validation utilities
const validators = {
  isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  isUUID(uuid) {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return re.test(uuid);
  },

  isUSState(state) {
    const states = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    ];
    return states.includes(state?.toUpperCase());
  },

  isPositiveInteger(num) {
    return Number.isInteger(num) && num > 0;
  },

  isNonNegativeInteger(num) {
    return Number.isInteger(num) && num >= 0;
  },

  validateSchema(data, schema) {
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rules.type && typeof value !== rules.type) {
        errors[field] = `${field} must be of type ${rules.type}`;
      }

      if (rules.isEmail && !this.isEmail(value)) {
        errors[field] = `${field} must be a valid email`;
      }

      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must be at most ${rules.maxLength} characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `${field} has invalid format`;
      }

      if (rules.isPositiveInteger && !this.isPositiveInteger(value)) {
        errors[field] = `${field} must be a positive integer`;
      }

      if (rules.isNonNegativeInteger && !this.isNonNegativeInteger(value)) {
        errors[field] = `${field} must be a non-negative integer`;
      }

      if (rules.isUSState && !this.isUSState(value)) {
        errors[field] = `${field} must be a valid US state code`;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  },
};

module.exports = validators;
