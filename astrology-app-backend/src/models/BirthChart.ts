import mongoose, { Schema, Document } from 'mongoose';

export interface IBirthChart extends Document {
  user_id: string;
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  planets: Record<string, any>;
  houses: Record<string, any>;
  aspects: any[];
  chart_data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

const BirthChartSchema: Schema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sun_sign: {
      type: String,
      required: true,
    },
    moon_sign: {
      type: String,
      required: true,
    },
    rising_sign: {
      type: String,
      required: true,
    },
    planets: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    houses: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    aspects: [Schema.Types.Mixed],
    chart_data: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model<IBirthChart>('BirthChart', BirthChartSchema);
