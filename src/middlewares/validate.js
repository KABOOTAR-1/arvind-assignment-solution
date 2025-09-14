import Joi from 'joi';

const faqSchema = Joi.object({
  question: Joi.string().required().min(10).max(1000),
  answer: Joi.string().required().min(10).max(5000),
  category: Joi.string().optional().max(100),
  keywords: Joi.array().items(Joi.string()).optional()
});

const userSchema = Joi.object({
  name: Joi.string().optional().max(255),
  email: Joi.string().email().optional(),
  metadata: Joi.object().optional()
});

const querySchema = Joi.object({
  question: Joi.string().required().min(3).max(1000),
  userId: Joi.string().uuid().optional(),
  sessionId: Joi.string().uuid().optional()
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

export default {
  validateFAQ: validate(faqSchema),
  validateUser: validate(userSchema),
  validateQuery: validate(querySchema)
};