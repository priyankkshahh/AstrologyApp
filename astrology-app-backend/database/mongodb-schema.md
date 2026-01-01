# MongoDB Collections Schema

This document describes the MongoDB collections used in the Holistic Divination App for flexible, document-based data storage.

## Collections

### birthcharts

Stores complete birth chart data for astrological readings.

```javascript
{
  _id: ObjectId,
  user_id: String (UUID from PostgreSQL),
  sun_sign: String,
  moon_sign: String,
  rising_sign: String,
  planets: {
    mercury: { sign: String, house: Number, degree: Number },
    venus: { sign: String, house: Number, degree: Number },
    mars: { sign: String, house: Number, degree: Number },
    // ... other planets
  },
  houses: {
    house_1: { sign: String, degree: Number },
    house_2: { sign: String, degree: Number },
    // ... other houses
  },
  aspects: [
    {
      planet1: String,
      planet2: String,
      aspect: String,
      orb: Number
    }
  ],
  chart_data: Object, // Additional flexible data
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
- `user_id` (unique)
- `created_at` (descending)

### readinghistory

Stores all types of readings (astrology, numerology, tarot, palmistry) with flexible schema.

```javascript
{
  _id: ObjectId,
  user_id: String (UUID from PostgreSQL),
  type: String, // 'astrology' | 'numerology' | 'tarot' | 'palmistry'
  subtype: String, // 'birth_chart' | 'daily_card' | 'life_path' | etc.
  data: Object, // Flexible structure based on reading type
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
- `user_id`
- `type`
- `created_at` (descending)
- Compound: `{ user_id: 1, type: 1, created_at: -1 }`

#### Reading Type Examples

**Astrology Reading**:
```javascript
{
  type: 'astrology',
  subtype: 'daily_horoscope',
  data: {
    sign: 'Leo',
    date: '2024-01-15',
    forecast: {
      love: 'Great day for romance...',
      career: 'Focus on teamwork...',
      health: 'Stay hydrated...',
      lucky_numbers: [7, 14, 21],
      lucky_color: 'Gold'
    }
  }
}
```

**Tarot Reading**:
```javascript
{
  type: 'tarot',
  subtype: 'three_card_spread',
  data: {
    spread_type: 'past_present_future',
    cards: [
      {
        position: 'past',
        card_name: 'The Fool',
        card_number: 0,
        suit: 'major_arcana',
        orientation: 'upright',
        interpretation: '...'
      },
      // ... more cards
    ],
    overall_interpretation: '...'
  }
}
```

**Numerology Reading**:
```javascript
{
  type: 'numerology',
  subtype: 'life_path',
  data: {
    birth_date: '1990-05-15',
    life_path_number: 3,
    destiny_number: 7,
    soul_urge_number: 1,
    personality_number: 6,
    interpretations: {
      life_path: '...',
      destiny: '...',
      soul_urge: '...',
      personality: '...'
    }
  }
}
```

**Palmistry Reading**:
```javascript
{
  type: 'palmistry',
  subtype: 'full_analysis',
  data: {
    hand_side: 'left',
    photo_id: 'uuid',
    analysis: {
      life_line: { length: 'long', depth: 'deep', interpretation: '...' },
      heart_line: { length: 'medium', depth: 'medium', interpretation: '...' },
      head_line: { length: 'long', depth: 'medium', interpretation: '...' },
      fate_line: { present: true, interpretation: '...' },
      mounts: {
        jupiter: { prominence: 'high', interpretation: '...' },
        saturn: { prominence: 'medium', interpretation: '...' },
        // ... other mounts
      }
    },
    overall_interpretation: '...'
  }
}
```

### reports

Stores generated reports (daily, weekly, monthly, yearly).

```javascript
{
  _id: ObjectId,
  user_id: String (UUID from PostgreSQL),
  report_type: String, // 'daily' | 'weekly' | 'monthly' | 'yearly' | 'life_path'
  report_date: Date,
  content: {
    astrology: Object,
    numerology: Object,
    tarot: Object,
    summary: String,
    recommendations: [String]
  },
  generated_at: Date
}
```

**Indexes**:
- `user_id`
- `report_type`
- `report_date` (descending)
- Compound: `{ user_id: 1, report_type: 1, report_date: -1 }`

## Connection String

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## Best Practices

1. **Validation**: Use Mongoose schemas for validation
2. **Indexes**: Create indexes for frequently queried fields
3. **Data Size**: Keep documents under 16MB
4. **Relationships**: Store user_id as reference to PostgreSQL users
5. **Timestamps**: Always include created_at and updated_at
6. **Flexible Schema**: Leverage MongoDB's flexibility for evolving data structures

## Future Collections

As the app evolves, additional collections may include:

- `predictions` - AI-generated predictions
- `user_queries` - User questions and AI responses
- `compatibility` - Relationship compatibility analyses
- `transits` - Current planetary transits
- `lunar_calendar` - Moon phase data and rituals
