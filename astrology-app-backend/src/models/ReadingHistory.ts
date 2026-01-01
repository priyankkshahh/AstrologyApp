import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingHistory extends Document {
  user_id: string;
  type: 'astrology' | 'numerology' | 'tarot' | 'palmistry';
  subtype: string;
  data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

const ReadingHistorySchema: Schema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['astrology', 'numerology', 'tarot', 'palmistry'],
    },
    subtype: {
      type: String,
      required: true,
    },
    data: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ReadingHistorySchema.index({ user_id: 1, type: 1, created_at: -1 });

export default mongoose.model<IReadingHistory>('ReadingHistory', ReadingHistorySchema);
