// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment the line below to silence console.log during tests
  // log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.HF_TOKEN = 'test-token';
process.env.HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
process.env.CONTEXT_SEMANTIC_MATCHES_LIMIT = '5';
process.env.CONTEXT_RECENT_QUERIES_LIMIT = '5';
process.env.CONTEXT_SIMILARITY_THRESHOLD = '0.5';
process.env.ANALYTICS_DEFAULT_LIMIT = '100';

// Global test utilities
global.createMockRequest = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  headers: {},
  ...overrides
});

global.createMockResponse = () => {
  const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
};

// Mock database pool for all tests
jest.mock('../config/database.js', () => ({
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
}));

// Mock external services
jest.mock('@huggingface/inference', () => ({
  InferenceClient: jest.fn().mockImplementation(() => ({
    featureExtraction: jest.fn(),
  })),
}));

// Setup and teardown
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});
