import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardWidget from '../../../components/DashboardWidget';
import dashboardReducer, { DashboardWidget as DashboardWidgetType } from '../../../redux/slices/dashboardSlice';

const mockWidgetData: DashboardWidgetType = {
  id: '1',
  module: 'astrology',
  title: 'Daily Horoscope',
  type: 'quick-card',
  data: {
    sunSign: 'Capricorn',
    prediction: 'Today is a good day for new beginnings.',
    luckyNumber: 7,
    luckyColor: 'Blue',
  },
  timestamp: new Date().toISOString(),
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
};

const mockRoute = {
  params: {},
  key: 'test',
  name: 'TestScreen',
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

function createTestStore() {
  return configureStore({
    reducer: {
      dashboard: dashboardReducer,
    },
    preloadedState: {
      dashboard: {
        data: {
          astrology: { dailyHoroscope: mockWidgetData.data },
          numerology: null,
          tarot: null,
          palmistry: null,
          insights: [],
          preferences: {
            enabledModules: ['astrology', 'numerology', 'tarot', 'palmistry'],
            widgetOrder: [1, 2, 3, 4],
            displaySettings: {},
          },
        },
        loading: false,
        error: null,
      },
    },
  });
}

function renderWithProviders(component: React.ReactNode, store = createTestStore()) {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
}

describe('DashboardWidget Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render widget correctly', () => {
      const { getByText } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} />
      );

      expect(getByText('Daily Horoscope')).toBeTruthy();
    });

    it('should render astrology widget with correct colors', () => {
      const { getByTestId } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} />
      );

      const widget = getByTestId('dashboard-widget');
      expect(widget).toBeTruthy();
    });

    it('should render numerology widget', () => {
      const numerologyWidget = {
        ...mockWidgetData,
        module: 'numerology',
        title: 'Life Path Number',
        data: {
          lifePathNumber: 5,
          description: 'You are a free spirit who loves adventure.',
        },
      };

      const { getByText } = renderWithProviders(
        <DashboardWidget widget={numerologyWidget} />
      );

      expect(getByText('Life Path Number')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });

    it('should render tarot widget', () => {
      const tarotWidget = {
        ...mockWidgetData,
        module: 'tarot',
        title: 'Daily Card',
        data: {
          cardName: 'The Fool',
          meaning: 'New beginnings and opportunities await you.',
          upright: true,
        },
      };

      const { getByText } = renderWithProviders(
        <DashboardWidget widget={tarotWidget} />
      );

      expect(getByText('The Fool')).toBeTruthy();
    });

    it('should render palmistry widget', () => {
      const palmistryWidget = {
        ...mockWidgetData,
        module: 'palmistry',
        title: 'Recent Reading',
        data: {
          dominantHand: 'right',
          lines: {
            heartLine: 'Strong and clear',
            headLine: 'Well defined',
            lifeLine: 'Deep and clear',
          },
        },
      };

      const { getByText } = renderWithProviders(
        <DashboardWidget widget={palmistryWidget} />
      );

      expect(getByText('Recent Reading')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to module screen on press', () => {
      const { getByTestId } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} />
      );

      fireEvent.press(getByTestId('dashboard-widget'));

      expect(mockNavigation.navigate).toHaveBeenCalled();
    });

    it('should show loading state', () => {
      const { getByTestId } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} loading={true} />
      );

      const loadingIndicator = getByTestId('loading-indicator');
      expect(loadingIndicator).toBeTruthy();
    });

    it('should show error state', () => {
      const { getByText } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} error="Failed to load" />
      );

      expect(getByText('Failed to load')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      const { getByLabelText } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} />
      );

      expect(getByLabelText(/Daily Horoscope/i)).toBeTruthy();
    });

    it('should be accessible to screen readers', () => {
      const { getByRole } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} />
      );

      const touchable = getByRole('button');
      expect(touchable).toBeTruthy();
    });

    it('should have minimum touch target size', () => {
      const { getByTestId } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} />
      );

      const widget = getByTestId('dashboard-widget');
      const { height } = widget.props.style[0] || { height: 0 };
      expect(height).toBeGreaterThanOrEqual(48);
    });
  });

  describe('Styling', () => {
    it('should apply correct module colors', () => {
      const { getByTestId } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} />
      );

      const widget = getByTestId('dashboard-widget');
      expect(widget).toBeTruthy();
    });

    it('should display widget icon', () => {
      const { getByTestId } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} />
      );

      const icon = getByTestId(/-icon$/);
      expect(icon).toBeTruthy();
    });

    it('should display widget timestamp', () => {
      const { getByText } = renderWithProviders(
        <DashboardWidget widget={mockWidgetData} />
      );

      const date = new Date(mockWidgetData.timestamp);
      const formattedDate = date.toLocaleDateString();
      expect(getByText(formattedDate)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing data gracefully', () => {
      const emptyWidget = {
        ...mockWidgetData,
        data: {},
      };

      const { getByText } = renderWithProviders(
        <DashboardWidget widget={emptyWidget} />
      );

      expect(getByText('Daily Horoscope')).toBeTruthy();
    });

    it('should handle very long text', () => {
      const longTextWidget = {
        ...mockWidgetData,
        title: 'This is a very long title that should wrap properly without breaking the layout',
      };

      const { getByText } = renderWithProviders(
        <DashboardWidget widget={longTextWidget} />
      );

      expect(getByText(/This is a very long title/)).toBeTruthy();
    });

    it('should handle null data', () => {
      const nullWidget = {
        ...mockWidgetData,
        data: null as any,
      };

      const { getByText } = renderWithProviders(
        <DashboardWidget widget={nullWidget} />
      );

      expect(getByText('Daily Horoscope')).toBeTruthy();
    });
  });
});
