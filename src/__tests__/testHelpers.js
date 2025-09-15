// Test helper utilities for the FAQ system

export const mockFAQData = {
  basic: {
    id: 1,
    question: 'What is AI?',
    answer: 'Artificial Intelligence is a branch of computer science.',
    category: 'technology',
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01')
  },
  withEmbedding: {
    id: 2,
    question: 'How does machine learning work?',
    answer: 'Machine learning uses algorithms to learn from data.',
    category: 'technology',
    embedding: JSON.stringify([0.1, 0.2, 0.3, 0.4]),
    created_at: new Date('2023-01-02'),
    updated_at: new Date('2023-01-02')
  }
};

export const mockUserData = {
  basic: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    metadata: {
      preferences: { detail_level: 'brief' }
    },
    created_at: new Date('2023-01-01')
  },
  withPreferences: {
    id: 2,
    name: 'Advanced User',
    email: 'advanced@example.com',
    metadata: {
      preferences: { 
        detail_level: 'detailed',
        topics: ['technology', 'science']
      }
    },
    created_at: new Date('2023-01-01')
  }
};

export const mockQueryData = {
  basic: {
    id: 1,
    user_id: 1,
    session_id: 'session123',
    question: 'What is artificial intelligence?',
    answer: 'AI is a branch of computer science.',
    similarity_score: 0.85,
    response_time_ms: 150,
    created_at: new Date('2023-01-01')
  },
  withContext: {
    id: 2,
    user_id: 1,
    session_id: 'session123',
    question: 'How does ML work?',
    answer: 'Machine learning uses algorithms.',
    context_used: {
      semanticMatches: [{ id: 1, similarity: 0.8 }],
      recentQueries: [],
      user: { preferences: {} }
    },
    similarity_score: 0.75,
    response_time_ms: 200,
    created_at: new Date('2023-01-02')
  }
};

export const mockEmbeddings = {
  ai: [0.8, 0.6, 0.0, 0.2],
  ml: [0.6, 0.8, 0.0, 0.1],
  weather: [0.0, 0.0, 1.0, 0.0],
  random: [0.3, 0.4, 0.5, 0.6]
};

export const createMockContextResult = (overrides = {}) => ({
  context: {
    semanticMatches: [
      {
        id: 1,
        question: 'What is AI?',
        answer: 'AI is artificial intelligence',
        category: 'technology',
        similarity: 0.9
      }
    ],
    recentQueries: [
      {
        question: 'Previous question',
        answer: 'Previous answer',
        timestamp: new Date(),
        similarity: 0.8
      }
    ],
    user: {
      metadata: { preferences: {} },
      profile: { name: 'Test User', email: 'test@example.com' }
    },
    sessionContext: { sessionId: 'session123' },
    assemblyTimestamp: new Date().toISOString(),
    processingTimeMs: 50,
    ...overrides.context
  },
  primaryMatch: {
    id: 1,
    question: 'What is AI?',
    answer: 'AI is artificial intelligence',
    ...overrides.primaryMatch
  },
  confidence: 0.85,
  ...overrides
});

export const createMockAnswerResult = (overrides = {}) => ({
  answer: 'This is the answer',
  confidence: 0.8,
  source: 'semantic_match',
  faq_id: 1,
  category: 'technology',
  ...overrides
});

export const mockDatabaseQueries = {
  getAllFAQs: 'SELECT * FROM faqs ORDER BY created_at DESC',
  getFAQById: 'SELECT * FROM faqs WHERE id = $1',
  createFAQ: 'INSERT INTO faqs (question, answer, category, embedding) VALUES ($1, $2, $3, $4) RETURNING *',
  updateFAQ: 'UPDATE faqs SET',
  deleteFAQ: 'DELETE FROM faqs WHERE id = $1',
  searchFAQs: 'SELECT *, (embedding <=> $1) AS distance FROM faqs ORDER BY distance LIMIT $2'
};

export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const expectDatabaseCall = (mockQuery, expectedQuery, expectedParams) => {
  expect(mockQuery).toHaveBeenCalledWith(
    expect.stringContaining(expectedQuery),
    expectedParams
  );
};

export const createMockAuditLog = (overrides = {}) => ({
  id: 1,
  query_id: 1,
  context_assembly_details: {
    contextSources: {
      semanticMatches: 2,
      recentQueries: 1,
      userContext: true
    },
    matchingAlgorithm: 'semantic_similarity',
    confidence: 0.8
  },
  performance_metrics: {
    totalResponseTime: 150,
    contextAssemblyTime: 50
  },
  created_at: new Date(),
  ...overrides
});
