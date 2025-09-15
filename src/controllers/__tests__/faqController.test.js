import faqController from '../faqController.js';
import FAQ from '../../models/FAQ.js';
import huggingfaceService from '../../service/huggingfaceService.js';

// Mock dependencies
jest.mock('../../models/FAQ.js');
jest.mock('../../service/huggingfaceService.js');

describe('FAQ Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      query: {},
      params: {},
      body: {}
    };
    
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getAllFAQs', () => {
    it('should return all FAQs without filters', async () => {
      const mockFAQs = [
        { id: 1, question: 'Test 1', answer: 'Answer 1', category: 'general' },
        { id: 2, question: 'Test 2', answer: 'Answer 2', category: 'tech' }
      ];
      
      FAQ.getAllFAQs.mockResolvedValue(mockFAQs);
      
      await faqController.getAllFAQs(mockReq, mockRes);
      
      expect(FAQ.getAllFAQs).toHaveBeenCalledWith({ category: undefined });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFAQs
      });
    });

    it('should return FAQs with category filter', async () => {
      const mockFAQs = [
        { id: 1, question: 'Tech question', answer: 'Tech answer', category: 'tech' }
      ];
      
      mockReq.query = { category: 'tech' };
      FAQ.getAllFAQs.mockResolvedValue(mockFAQs);
      
      await faqController.getAllFAQs(mockReq, mockRes);
      
      expect(FAQ.getAllFAQs).toHaveBeenCalledWith({ category: 'tech' });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFAQs
      });
    });

    it('should return FAQs with limit', async () => {
      const mockFAQs = [
        { id: 1, question: 'Test 1', answer: 'Answer 1', category: 'general' }
      ];
      
      mockReq.query = { limit: '5' };
      FAQ.getAllFAQs.mockResolvedValue(mockFAQs);
      
      await faqController.getAllFAQs(mockReq, mockRes);
      
      expect(FAQ.getAllFAQs).toHaveBeenCalledWith({ category: undefined, limit: 5 });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFAQs
      });
    });

    it('should ignore invalid limit values', async () => {
      const mockFAQs = [];
      
      mockReq.query = { limit: 'invalid' };
      FAQ.getAllFAQs.mockResolvedValue(mockFAQs);
      
      await faqController.getAllFAQs(mockReq, mockRes);
      
      expect(FAQ.getAllFAQs).toHaveBeenCalledWith({ category: undefined });
    });

    it('should handle database errors', async () => {
      FAQ.getAllFAQs.mockRejectedValue(new Error('Database connection failed'));
      
      await faqController.getAllFAQs(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database connection failed'
      });
    });
  });

  describe('getFAQById', () => {
    it('should return FAQ by ID', async () => {
      const mockFAQ = { id: 1, question: 'Test', answer: 'Answer', category: 'general' };
      
      mockReq.params = { id: '1' };
      FAQ.getFAQById.mockResolvedValue(mockFAQ);
      
      await faqController.getFAQById(mockReq, mockRes);
      
      expect(FAQ.getFAQById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFAQ
      });
    });

    it('should return 404 for non-existent FAQ', async () => {
      mockReq.params = { id: '999' };
      FAQ.getFAQById.mockResolvedValue(null);
      
      await faqController.getFAQById(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'FAQ not found'
      });
    });

    it('should handle database errors', async () => {
      mockReq.params = { id: '1' };
      FAQ.getFAQById.mockRejectedValue(new Error('Database error'));
      
      await faqController.getFAQById(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error'
      });
    });
  });

  describe('createFAQ', () => {
    it('should create FAQ with embedding', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockFAQ = { id: 1, question: 'New question', answer: 'New answer', category: 'general' };
      
      mockReq.body = {
        question: 'New question',
        answer: 'New answer',
        category: 'general'
      };
      
      huggingfaceService.requestEmbedding.mockResolvedValue(mockEmbedding);
      FAQ.createFAQ.mockResolvedValue(mockFAQ);
      
      await faqController.createFAQ(mockReq, mockRes);
      
      expect(huggingfaceService.requestEmbedding).toHaveBeenCalledWith('New question');
      expect(FAQ.createFAQ).toHaveBeenCalledWith({
        question: 'New question',
        answer: 'New answer',
        category: 'general',
        embedding: JSON.stringify(mockEmbedding)
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFAQ
      });
    });

    it('should create FAQ without embedding when service fails', async () => {
      const mockFAQ = { id: 1, question: 'New question', answer: 'New answer', category: 'general' };
      
      mockReq.body = {
        question: 'New question',
        answer: 'New answer',
        category: 'general'
      };
      
      huggingfaceService.requestEmbedding.mockResolvedValue(null);
      FAQ.createFAQ.mockResolvedValue(mockFAQ);
      
      await faqController.createFAQ(mockReq, mockRes);
      
      expect(FAQ.createFAQ).toHaveBeenCalledWith({
        question: 'New question',
        answer: 'New answer',
        category: 'general',
        embedding: null
      });
    });

    it('should handle creation errors', async () => {
      mockReq.body = {
        question: 'New question',
        answer: 'New answer',
        category: 'general'
      };
      
      huggingfaceService.requestEmbedding.mockResolvedValue([0.1, 0.2]);
      FAQ.createFAQ.mockRejectedValue(new Error('Creation failed'));
      
      await faqController.createFAQ(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Creation failed'
      });
    });

    it('should handle embedding service errors', async () => {
      const mockFAQ = { id: 1, question: 'New question', answer: 'New answer' };
      
      mockReq.body = {
        question: 'New question',
        answer: 'New answer',
        category: 'general'
      };
      
      huggingfaceService.requestEmbedding.mockRejectedValue(new Error('Embedding failed'));
      FAQ.createFAQ.mockResolvedValue(mockFAQ);
      
      await faqController.createFAQ(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Embedding failed'
      });
    });
  });

  describe('updateFAQ', () => {
    it('should update FAQ with new embedding when question changes', async () => {
      const mockEmbedding = [0.4, 0.5, 0.6];
      const mockFAQ = { id: 1, question: 'Updated question', answer: 'Original answer' };
      
      mockReq.params = { id: '1' };
      mockReq.body = {
        question: 'Updated question'
      };
      
      huggingfaceService.requestEmbedding.mockResolvedValue(mockEmbedding);
      FAQ.updateFAQ.mockResolvedValue(mockFAQ);
      
      await faqController.updateFAQ(mockReq, mockRes);
      
      expect(huggingfaceService.requestEmbedding).toHaveBeenCalledWith('Updated question');
      expect(FAQ.updateFAQ).toHaveBeenCalledWith('1', {
        question: 'Updated question',
        embedding: JSON.stringify(mockEmbedding)
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFAQ
      });
    });

    it('should update FAQ without generating embedding when question unchanged', async () => {
      const mockFAQ = { id: 1, question: 'Original question', answer: 'Updated answer' };
      
      mockReq.params = { id: '1' };
      mockReq.body = {
        answer: 'Updated answer'
      };
      
      FAQ.updateFAQ.mockResolvedValue(mockFAQ);
      
      await faqController.updateFAQ(mockReq, mockRes);
      
      expect(huggingfaceService.requestEmbedding).not.toHaveBeenCalled();
      expect(FAQ.updateFAQ).toHaveBeenCalledWith('1', {
        answer: 'Updated answer'
      });
    });

    it('should return 404 for non-existent FAQ', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { answer: 'Updated answer' };
      
      FAQ.updateFAQ.mockResolvedValue(null);
      
      await faqController.updateFAQ(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'FAQ not found'
      });
    });

    it('should handle update errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { answer: 'Updated answer' };
      
      FAQ.updateFAQ.mockRejectedValue(new Error('Update failed'));
      
      await faqController.updateFAQ(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Update failed'
      });
    });

    it('should handle embedding failure during update', async () => {
      const mockFAQ = { id: 1, question: 'Updated question', answer: 'Answer' };
      
      mockReq.params = { id: '1' };
      mockReq.body = { question: 'Updated question' };
      
      huggingfaceService.requestEmbedding.mockResolvedValue(null);
      FAQ.updateFAQ.mockResolvedValue(mockFAQ);
      
      await faqController.updateFAQ(mockReq, mockRes);
      
      expect(FAQ.updateFAQ).toHaveBeenCalledWith('1', {
        question: 'Updated question',
        embedding: null
      });
    });
  });

  describe('deleteFAQ', () => {
    it('should delete FAQ successfully', async () => {
      mockReq.params = { id: '1' };
      FAQ.deleteFAQ.mockResolvedValue(true);
      
      await faqController.deleteFAQ(mockReq, mockRes);
      
      expect(FAQ.deleteFAQ).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'FAQ deleted successfully'
      });
    });

    it('should return 404 for non-existent FAQ', async () => {
      mockReq.params = { id: '999' };
      FAQ.deleteFAQ.mockResolvedValue(null);
      
      await faqController.deleteFAQ(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'FAQ not found'
      });
    });

    it('should handle deletion errors', async () => {
      mockReq.params = { id: '1' };
      FAQ.deleteFAQ.mockRejectedValue(new Error('Deletion failed'));
      
      await faqController.deleteFAQ(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Deletion failed'
      });
    });
  });
});
