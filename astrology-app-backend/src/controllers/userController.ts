import { Response } from 'express';
import { AuthRequest } from '../types';
import { UserModel } from '../models/User';
import { UserProfileModel } from '../models/UserProfile';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const user = await UserModel.findById(req.user.id);
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const profile = await UserProfileModel.findByUserId(req.user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        email_verified: user.email_verified,
        is_active: user.is_active,
        created_at: user.created_at,
      },
      profile,
    },
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const profile = await UserProfileModel.update(req.user.id, req.body);

  if (!profile) {
    throw new ApiError('Profile not found', 404);
  }

  res.json({
    success: true,
    data: { profile },
    message: 'Profile updated successfully',
  });
});

export const completeOnboarding = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  const success = await UserProfileModel.markProfileCompleted(req.user.id);

  if (!success) {
    throw new ApiError('Failed to complete onboarding', 500);
  }

  res.json({
    success: true,
    message: 'Onboarding completed successfully',
  });
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401);
  }

  await UserModel.delete(req.user.id);

  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});
