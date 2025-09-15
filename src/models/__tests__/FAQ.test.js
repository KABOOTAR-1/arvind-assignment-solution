import FAQ from '../FAQ.js';
import pool from '../../config/database.js';
import huggingfaceService from '../../service/huggingfaceService.js';

// Mock dependencies
jest.mock('../../config/database.js');
jest.mock('../../service/huggingfaceService.js');

describe('FAQ Model', () => {
  let mockQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn();
    pool.query = mockQuery;
  });

  describe('createFAQ', () => {
    const mockEmbedding = [0.1, 0.2, 0.3, 0.4];
    const mockFAQData = {
      question: 'What is AI?',
      answer: 'AI is artificial intelligence',
      category: 'technology'
    };

    it('should create FAQ with embedding', async () => {
      const mockResult = {
        rows: [{
          id: 1,
          question: 'What is AI?',
          answer: 'AI is artificial intelligence',
          category: 'technology',
          embedding: JSON.stringify(mockEmbedding),
          created_at: new Date()
        }]
      };

      huggingfaceService.requestEmbedding.mockResolvedValue(mockEmbedding);
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.createFAQ(mockFAQData);

      expect(huggingfaceService.requestEmbedding).toHaveBeenCalledWith('What is AI? AI is artificial intelligence');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO faqs'),
        ['What is AI?', 'AI is artificial intelligence', 'technology', JSON.stringify(mockEmbedding)]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should create FAQ without embedding when service fails', async () => {
      const mockResult = {
        rows: [{
          id: 1,
          question: 'What is AI?',
          answer: 'AI is artificial intelligence',
          category: 'technology',
          embedding: null,
          created_at: new Date()
        }]
      };

      huggingfaceService.requestEmbedding.mockResolvedValue(null);
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.createFAQ(mockFAQData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO faqs'),
        ['What is AI?', 'AI is artificial intelligence', 'technology', null]
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should handle database errors', async () => {
      huggingfaceService.requestEmbedding.mockResolvedValue(mockEmbedding);
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      await expect(FAQ.createFAQ(mockFAQData)).rejects.toThrow('Database connection failed');
    });

    it('should handle embedding service errors', async () => {
      huggingfaceService.requestEmbedding.mockRejectedValue(new Error('Embedding service failed'));

      await expect(FAQ.createFAQ(mockFAQData)).rejects.toThrow('Embedding service failed');
    });
  });

  describe('getAllFAQs', () => {
    const mockFAQs = [
      { id: 1, question: 'Q1', answer: 'A1', category: 'tech', created_at: new Date() },
      { id: 2, question: 'Q2', answer: 'A2', category: 'general', created_at: new Date() }
    ];

    it('should return all FAQs without filters', async () => {
      const mockResult = { rows: mockFAQs };
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.getAllFAQs();

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM faqs ORDER BY created_at DESC',
        []
      );
      expect(result).toEqual(mockFAQs);
    });

    it('should return FAQs with category filter', async () => {
      const techFAQs = [mockFAQs[0]];
      const mockResult = { rows: techFAQs };
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.getAllFAQs({ category: 'tech' });

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM faqs WHERE category = $1 ORDER BY created_at DESC',
        ['tech']
      );
      expect(result).toEqual(techFAQs);
    });

    it('should return FAQs with limit', async () => {
      const limitedFAQs = [mockFAQs[0]];
      const mockResult = { rows: limitedFAQs };
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.getAllFAQs({ limit: 1 });

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM faqs ORDER BY created_at DESC LIMIT $1',
        [1]
      );
      expect(result).toEqual(limitedFAQs);
    });

    it('should return FAQs with category and limit', async () => {
      const filteredFAQs = [mockFAQs[0]];
      const mockResult = { rows: filteredFAQs };
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.getAllFAQs({ category: 'tech', limit: 1 });

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM faqs WHERE category = $1 ORDER BY created_at DESC LIMIT $2',
        ['tech', 1]
      );
      expect(result).toEqual(filteredFAQs);
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(FAQ.getAllFAQs()).rejects.toThrow('Database error');
    });
  });

  describe('getFAQById', () => {
    const mockFAQ = {
      id: 1,
      question: 'Test question',
      answer: 'Test answer',
      category: 'test',
      created_at: new Date()
    };

    it('should return FAQ by ID', async () => {
      const mockResult = { rows: [mockFAQ] };
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.getFAQById(1);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM faqs WHERE id = $1',
        [1]
      );
      expect(result).toEqual(mockFAQ);
    });

    it('should return undefined for non-existent FAQ', async () => {
      const mockResult = { rows: [] };
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.getFAQById(999);

      expect(result).toBeUndefined();
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(FAQ.getFAQById(1)).rejects.toThrow('Database error');
    });
  });

  describe('updateFAQ', () => {
    const existingFAQ = {
      id: 1,
      question: 'Original question',
      answer: 'Original answer',
      category: 'tech'
    };

    it('should update FAQ without regenerating embedding', async () => {
      const updateData = { answer: 'Updated answer' };
      const updatedFAQ = { ...existingFAQ, answer: 'Updated answer' };
      const mockResult = { rows: [updatedFAQ] };

      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.updateFAQ(1, updateData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE faqs SET answer = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2'),
        ['Updated answer', 1]
      );
      expect(result).toEqual(updatedFAQ);
    });

    it('should update FAQ and regenerate embedding when question changes', async () => {
      const updateData = { question: 'Updated question' };
      const mockEmbedding = [0.5, 0.6, 0.7];
      const updatedFAQ = { ...existingFAQ, question: 'Updated question' };
      
      // Mock getFAQById call
      mockQuery
        .mockResolvedValueOnce({ rows: [existingFAQ] }) // getFAQById
        .mockResolvedValueOnce({ rows: [updatedFAQ] }); // updateFAQ

      huggingfaceService.requestEmbedding.mockResolvedValue(mockEmbedding);

      const result = await FAQ.updateFAQ(1, updateData);

      expect(huggingfaceService.requestEmbedding).toHaveBeenCalledWith('Updated question Original answer');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('getFAQById'),
        [1]
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE faqs SET question = $1, embedding = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3'),
        ['Updated question', JSON.stringify(mockEmbedding), 1]
      );
    });

    it('should update FAQ and regenerate embedding when answer changes', async () => {
      const updateData = { answer: 'Updated answer' };
      const mockEmbedding = [0.5, 0.6, 0.7];
      const updatedFAQ = { ...existingFAQ, answer: 'Updated answer' };
      
      mockQuery
        .mockResolvedValueOnce({ rows: [existingFAQ] })
        .mockResolvedValueOnce({ rows: [updatedFAQ] });

      huggingfaceService.requestEmbedding.mockResolvedValue(mockEmbedding);

      const result = await FAQ.updateFAQ(1, updateData);

      expect(huggingfaceService.requestEmbedding).toHaveBeenCalledWith('Original question Updated answer');
    });

    it('should handle embedding generation failure during update', async () => {
      const updateData = { question: 'Updated question' };
      const updatedFAQ = { ...existingFAQ, question: 'Updated question' };
      
      mockQuery
        .mockResolvedValueOnce({ rows: [existingFAQ] })
        .mockResolvedValueOnce({ rows: [updatedFAQ] });

      huggingfaceService.requestEmbedding.mockResolvedValue(null);

      const result = await FAQ.updateFAQ(1, updateData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE faqs SET question = $1, embedding = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3'),
        ['Updated question', null, 1]
      );
    });

    it('should handle non-existent FAQ during update', async () => {
      const updateData = { question: 'Updated question' };
      
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // getFAQById returns empty
        .mockResolvedValueOnce({ rows: [] }); // updateFAQ returns empty

      const result = await FAQ.updateFAQ(999, updateData);

      expect(result).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const updateData = { answer: 'Updated answer' };
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(FAQ.updateFAQ(1, updateData)).rejects.toThrow('Database error');
    });
  });

  describe('deleteFAQ', () => {
    it('should delete FAQ successfully', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const result = await FAQ.deleteFAQ(1);

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM faqs WHERE id = $1',
        [1]
      );
      expect(result).toBe(true);
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(FAQ.deleteFAQ(1)).rejects.toThrow('Database error');
    });
  });

  describe('searchFAQs', () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockSearchResults = [
      {
        id: 1,
        question: 'Similar question',
        answer: 'Similar answer',
        distance: 0.1
      },
      {
        id: 2,
        question: 'Another similar question',
        answer: 'Another similar answer',
        distance: 0.2
      }
    ];

    it('should search FAQs by embedding with default limit', async () => {
      const mockResult = { rows: mockSearchResults };
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.searchFAQs(mockEmbedding);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT *, (embedding <=> $1) AS distance'),
        [mockEmbedding, 5]
      );
      expect(result).toEqual(mockSearchResults);
    });

    it('should search FAQs by embedding with custom limit', async () => {
      const mockResult = { rows: mockSearchResults.slice(0, 1) };
      mockQuery.mockResolvedValue(mockResult);

      const result = await FAQ.searchFAQs(mockEmbedding, 1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT *, (embedding <=> $1) AS distance'),
        [mockEmbedding, 1]
      );
      expect(result).toEqual(mockSearchResults.slice(0, 1));
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(FAQ.searchFAQs(mockEmbedding)).rejects.toThrow('Database error');
    });
  });
});
