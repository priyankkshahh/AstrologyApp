import Joi from 'joi';

export const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  full_name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 255 characters',
    'any.required': 'Full name is required',
  }),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const profileUpdateSchema = Joi.object({
  full_name: Joi.string().min(2).max(255).optional(),
  date_of_birth: Joi.date().max('now').optional().messages({
    'date.max': 'Date of birth cannot be in the future',
  }),
  birth_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().messages({
    'string.pattern.base': 'Birth time must be in HH:MM format',
  }),
  birth_city: Joi.string().max(255).optional(),
  birth_country: Joi.string().max(255).optional(),
  birth_latitude: Joi.number().min(-90).max(90).optional(),
  birth_longitude: Joi.number().min(-180).max(180).optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
  timezone: Joi.string().max(100).optional(),
});

export const preferencesSchema = Joi.object({
  notifications_enabled: Joi.boolean().optional(),
  daily_horoscope: Joi.boolean().optional(),
  theme: Joi.string().valid('light', 'dark').optional(),
  language: Joi.string().length(2).optional(),
});

export const oauthSchema = Joi.object({
  provider: Joi.string().valid('google', 'apple').required(),
  token: Joi.string().required(),
  email: Joi.string().email().required(),
  name: Joi.string().optional(),
  provider_id: Joi.string().required(),
});

export const palmPhotoUploadSchema = Joi.object({
  hand_side: Joi.string().valid('left', 'right').required().messages({
    'any.only': 'Hand side must be either "left" or "right"',
    'any.required': 'Hand side is required',
  }),
});

export const validateRequest = <T>(schema: Joi.ObjectSchema, data: unknown): T => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    throw new Error(errorMessage);
  }
  
  return value as T;
};
