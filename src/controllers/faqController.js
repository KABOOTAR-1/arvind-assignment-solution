import FAQ from '../models/FAQ.js';

const getAllFAQs = async (req, res) => {
  try {
    const { category, limit } = req.query;
    const faqs = await FAQ.getAllFAQs({ category, limit: parseInt(limit) });
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
    const faq = await FAQ.createFAQ(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.updateFAQ(req.params.id, req.body);
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