// Test setup file
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn((mailOptions, callback) => callback(null, { messageId: 'test-id' }))
  }))
}));

// Mock mysql2
jest.mock('mysql2', () => ({
  createConnection: jest.fn(() => ({
    connect: jest.fn((callback) => callback(new Error('Mock DB connection failed'))),
    query: jest.fn(),
    end: jest.fn()
  }))
}));