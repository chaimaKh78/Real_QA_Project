const {
  hashPassword,
  generateResetToken,
  validatePassword,
  validateEmail,
  validateUsername
} = require('../../utils/auth');

describe('Authentication Utilities', () => {
  describe('hashPassword', () => {
    test('should hash password consistently', () => {
      const password = 'testpassword';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA256 produces 64 character hex string
    });

    test('should produce different hashes for different passwords', () => {
      const hash1 = hashPassword('password1');
      const hash2 = hashPassword('password2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateResetToken', () => {
    test('should generate a random token', () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();

      expect(token1).not.toBe(token2);
      expect(token1).toHaveLength(64); // 32 bytes * 2 hex chars per byte
      expect(typeof token1).toBe('string');
    });
  });

  describe('validatePassword', () => {
    test('should validate strong passwords', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('123456')).toBe(true);
    });

    test('should reject weak passwords', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('test.email@subdomain.example.com')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    test('should validate correct usernames', () => {
      expect(validateUsername('testuser')).toBe(true);
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('test_user')).toBe(true);
      expect(validateUsername('abc')).toBe(true);
    });

    test('should reject invalid usernames', () => {
      expect(validateUsername('')).toBe(false);
      expect(validateUsername('ab')).toBe(false);
      expect(validateUsername('user-name')).toBe(false);
      expect(validateUsername('user name')).toBe(false);
      expect(validateUsername('user@name')).toBe(false);
      expect(validateUsername(null)).toBe(false);
    });
  });
});