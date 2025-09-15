import FAQ from '../models/FAQ.js';
import huggingfaceService from '../service/huggingfaceService.js';

const getAllFAQs = async (req, res) => {
  try {
    const { category, limit } = req.query;
    const filters = { category };
    if (limit && !isNaN(parseInt(limit))) {
      filters.limit = parseInt(limit);
    }
    const faqs = await FAQ.getAllFAQs(filters);
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.getFAQById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, error: 'FAQ not found' });
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createFAQ = async (req, res) => {
  try {
    // Generate embedding for the question
    const embedding = await huggingfaceService.requestEmbedding(req.body.question);
    
    // Create FAQ with embedding
    const faqData = {
      ...req.body,
      embedding: embedding ? JSON.stringify(embedding) : null
    };
    
    const faq = await FAQ.createFAQ(faqData);
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateFAQ = async (req, res) => {
  try {
    // Generate embedding for the question if it's being updated
    let faqData = { ...req.body };
    
    if (req.body.question) {
      const embedding = await huggingfaceService.requestEmbedding(req.body.question);
      faqData.embedding = embedding ? JSON.stringify(embedding) : null;
    }
    
    const faq = await FAQ.updateFAQ(req.params.id, faqData);
    if (!faq) return res.status(404).json({ success: false, error: 'FAQ not found' });
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.deleteFAQ(req.params.id);
    if (!faq) return res.status(404).json({ success: false, error: 'FAQ not found' });
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ
}