import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { UserProfileModel } from '../models/UserProfile';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { validateRequest, signupSchema, loginSchema, oauthSchema } from '../utils/validators';
import { SignupData, LoginCredentials, OAuthData, AuthRequest } from '../types';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const data = validateRequest<SignupData>(signupSchema, req.body);

  const existingUser = await UserModel.findByEmail(data.email);
  if (existingUser) {
    throw new ApiError('Email already registered', 409);
  }

  const user = await UserModel.create({
    email: data.email,
    password: data.password,
    phone: data.phone,
  });

  await UserProfileModel.create({
    user_id: user.id,
    full_name: data.full_name,
  });

  const tokens = generateTokenPair({ id: user.id, email: user.email });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
      },
      accessToken: tokens.accessToken,
    },
    message: 'User registered successfully',
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = validateRequest<LoginCredentials>(loginSchema, req.body);

  const user = await UserModel.verifyPassword(data.email, data.password);
  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw new ApiError('Account is deactivated', 403);
  }

  const tokens = generateTokenPair({ id: user.id, email: user.email });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
      },
      accessToken: tokens.accessToken,
    },
    message: 'Login successful',
  });
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const data = validateRequest<OAuthData>(oauthSchema, req.body);

  let user = await UserModel.findByGoogleId(data.provider_id);

  if (!user) {
    user = await UserModel.findByEmail(data.email);
    
    if (user) {
      await UserModel.update(user.id, { google_id: data.provider_id });
    } else {
      user = await UserModel.create({
        email: data.email,
        google_id: data.provider_id,
      });

      await UserProfileModel.create({
        user_id: user.id,
        full_name: data.name || 'User',
      });
    }
  }

  const tokens = generateTokenPair({ id: user.id, email: user.email });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
      },
      accessToken: tokens.accessToken,
    },
    message: 'Google authentication successful',
  });
});

export const appleAuth = asyncHandler(async (req: Request, res: Response) => {
  const data = validateRequest<OAuthData>(oauthSchema, req.body);

  let user = await UserModel.findByAppleId(data.provider_id);

  if (!user) {
    user = await UserModel.findByEmail(data.email);
    
    if (user) {
      await UserModel.update(user.id, { apple_id: data.provider_id });
    } else {
      user = await UserModel.create({
        email: data.email,
        apple_id: data.provider_id,
      });

      await UserProfileModel.create({
        user_id: user.id,
        full_name: data.name || 'User',
      });
    }
  }

  const tokens = generateTokenPair({ id: user.id, email: user.email });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
      },
      accessToken: tokens.accessToken,
    },
    message: 'Apple authentication successful',
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError('Refresh token not provided', 401);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await UserModel.findById(decoded.id);

    if (!user || !user.is_active) {
      throw new ApiError('User not found or inactive', 401);
    }

    const tokens = generateTokenPair({ id: user.id, email: user.email });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    throw new ApiError('Invalid refresh token', 401);
  }
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logout successful',
  });
});
