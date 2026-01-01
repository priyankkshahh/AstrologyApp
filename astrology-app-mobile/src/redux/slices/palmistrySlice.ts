import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { PalmPhoto, PalmAnalysis, LineAnalysis, MountAnalysis, FingerAnalysis } from '../../types/palmistry.types';

interface PalmistryState {
  palmPhotos: PalmPhoto[];
  currentAnalysis: PalmAnalysis | null;
  lineAnalysis: LineAnalysis[] | null;
  mountAnalysis: MountAnalysis[] | null;
  fingerAnalysis: FingerAnalysis[] | null;
  personalityProfile: any | null;
  loading: {
    upload: boolean;
    photos: boolean;
    analysis: boolean;
    lines: boolean;
    mounts: boolean;
    fingers: boolean;
    profile: boolean;
  };
  error: string | null;
}

const initialState: PalmistryState = {
  palmPhotos: [],
  currentAnalysis: null,
  lineAnalysis: null,
  mountAnalysis: null,
  fingerAnalysis: null,
  personalityProfile: null,
  loading: {
    upload: false,
    photos: false,
    analysis: false,
    lines: false,
    mounts: false,
    fingers: false,
    profile: false,
  },
  error: null,
};

// Async thunks
export const uploadPalmPhoto = createAsyncThunk(
  'palmistry/uploadPalmPhoto',
  async ({ userId, imageUri, handSide }: {
    userId: string;
    imageUri: string;
    handSide: 'left' | 'right';
  }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Create file object from URI
      const filename = imageUri.split('/').pop() || 'palm.jpg';
      const match = filename.match(/\.\w+$/);
      const type = match ? `image/${match[0].substring(1)}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        type,
        name: filename,
      } as any);
      
      formData.append('hand_side', handSide);

      const response = await apiService.post(`/palmistry/upload-palm/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload palm photo');
    }
  }
);

export const fetchUserPalmPhotos = createAsyncThunk(
  'palmistry/fetchUserPalmPhotos',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/palmistry/palm-photos/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch palm photos');
    }
  }
);

export const fetchPalmAnalysis = createAsyncThunk(
  'palmistry/fetchPalmAnalysis',
  async ({ userId, palmId }: { userId: string; palmId: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/palmistry/palm-analysis/${userId}/${palmId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch palm analysis');
    }
  }
);

export const fetchLineAnalysis = createAsyncThunk(
  'palmistry/fetchLineAnalysis',
  async (palmId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/palmistry/lines/${palmId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to analyze palm lines');
    }
  }
);

export const fetchMountAnalysis = createAsyncThunk(
  'palmistry/fetchMountAnalysis',
  async (palmId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/palmistry/mounts/${palmId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to analyze mounts');
    }
  }
);

export const fetchFingerAnalysis = createAsyncThunk(
  'palmistry/fetchFingerAnalysis',
  async (palmId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/palmistry/fingers/${palmId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to analyze fingers');
    }
  }
);

export const fetchPersonalityProfile = createAsyncThunk(
  'palmistry/fetchPersonalityProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/palmistry/personality-profile/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate personality profile');
    }
  }
);

export const deletePalmPhoto = createAsyncThunk(
  'palmistry/deletePalmPhoto',
  async ({ userId, palmId }: { userId: string; palmId: string }, { rejectWithValue }) => {
    try {
      await apiService.delete(`/palmistry/palm-photos/${userId}/${palmId}`);
      return palmId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete palm photo');
    }
  }
);

const palmistrySlice = createSlice({
  name: 'palmistry',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnalysis: (state) => {
      state.currentAnalysis = null;
      state.lineAnalysis = null;
      state.mountAnalysis = null;
      state.fingerAnalysis = null;
      state.personalityProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload palm photo
      .addCase(uploadPalmPhoto.pending, (state) => {
        state.loading.upload = true;
        state.error = null;
      })
      .addCase(uploadPalmPhoto.fulfilled, (state, action) => {
        state.loading.upload = false;
        state.palmPhotos.unshift(action.payload.data);
      })
      .addCase(uploadPalmPhoto.rejected, (state, action) => {
        state.loading.upload = false;
        state.error = action.payload as string;
      })

      // Fetch user palm photos
      .addCase(fetchUserPalmPhotos.pending, (state) => {
        state.loading.photos = true;
        state.error = null;
      })
      .addCase(fetchUserPalmPhotos.fulfilled, (state, action) => {
        state.loading.photos = false;
        state.palmPhotos = action.payload.data;
      })
      .addCase(fetchUserPalmPhotos.rejected, (state, action) => {
        state.loading.photos = false;
        state.error = action.payload as string;
      })

      // Fetch palm analysis
      .addCase(fetchPalmAnalysis.pending, (state) => {
        state.loading.analysis = true;
        state.error = null;
      })
      .addCase(fetchPalmAnalysis.fulfilled, (state, action) => {
        state.loading.analysis = false;
        state.currentAnalysis = action.payload.data;
      })
      .addCase(fetchPalmAnalysis.rejected, (state, action) => {
        state.loading.analysis = false;
        state.error = action.payload as string;
      })

      // Fetch line analysis
      .addCase(fetchLineAnalysis.pending, (state) => {
        state.loading.lines = true;
        state.error = null;
      })
      .addCase(fetchLineAnalysis.fulfilled, (state, action) => {
        state.loading.lines = false;
        state.lineAnalysis = action.payload.data.lines;
      })
      .addCase(fetchLineAnalysis.rejected, (state, action) => {
        state.loading.lines = false;
        state.error = action.payload as string;
      })

      // Fetch mount analysis
      .addCase(fetchMountAnalysis.pending, (state) => {
        state.loading.mounts = true;
        state.error = null;
      })
      .addCase(fetchMountAnalysis.fulfilled, (state, action) => {
        state.loading.mounts = false;
        state.mountAnalysis = action.payload.data.mounts;
      })
      .addCase(fetchMountAnalysis.rejected, (state, action) => {
        state.loading.mounts = false;
        state.error = action.payload as string;
      })

      // Fetch finger analysis
      .addCase(fetchFingerAnalysis.pending, (state) => {
        state.loading.fingers = true;
        state.error = null;
      })
      .addCase(fetchFingerAnalysis.fulfilled, (state, action) => {
        state.loading.fingers = false;
        state.fingerAnalysis = action.payload.data.fingers;
      })
      .addCase(fetchFingerAnalysis.rejected, (state, action) => {
        state.loading.fingers = false;
        state.error = action.payload as string;
      })

      // Fetch personality profile
      .addCase(fetchPersonalityProfile.pending, (state) => {
        state.loading.profile = true;
        state.error = null;
      })
      .addCase(fetchPersonalityProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.personalityProfile = action.payload.data;
      })
      .addCase(fetchPersonalityProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error = action.payload as string;
      })

      // Delete palm photo
      .addCase(deletePalmPhoto.fulfilled, (state, action) => {
        state.palmPhotos = state.palmPhotos.filter(photo => photo.id !== action.payload);
      });
  },
});

export const { clearError, clearAnalysis } = palmistrySlice.actions;
export default palmistrySlice.reducer;