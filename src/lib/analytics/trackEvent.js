/**
 * Analytics Event Tracking Utility
 *
 * Centralized event tracking for GA4, Amplitude, and other analytics platforms
 */

// Event payload type
// type EventPayload = Record<string, any>;

/**
 * Analytics Event Names
 *
 * Page View Events
 * - page_view: General page view tracking
 *
 * Authentication Events
 * - signup_started: User started signup process
 * - signup_completed: User completed signup
 * - login_completed: User logged in
 *
 * Search & Filter Events
 * - search_performed: User performed a search
 * - filter_changed: User changed search filters
 * - lab_list_scrolled: User scrolled through lab list
 *
 * Lab Detail Events
 * - lab_viewed: User viewed lab detail page
 * - lab_favorite_added: User added lab to favorites
 * - lab_favorite_removed: User removed lab from favorites
 *
 * Review Events
 * - review_write_started: User started writing a review
 * - review_submitted: User submitted a review
 * - review_helpful_clicked: User marked review as helpful
 *
 * Mock Interview Events
 * - mock_interview_booking_started: User started booking mock interview
 * - mock_interview_lab_selected: User selected labs for mock interview
 * - mock_interview_slot_selected: User selected time slot
 * - mock_interview_booking_completed: User completed booking
 * - mock_interview_cancelled: User cancelled interview session
 *
 * Profile Events
 * - profile_updated: User updated their profile
 * - research_interests_updated: User updated research interests
 */

export const AnalyticsEvents = {
  // Page View
  PAGE_VIEW: 'page_view',

  // Authentication
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',

  // Search & Filter
  SEARCH_PERFORMED: 'search_performed',
  FILTER_CHANGED: 'filter_changed',
  LAB_LIST_SCROLLED: 'lab_list_scrolled',

  // Lab Detail
  LAB_VIEWED: 'lab_viewed',
  LAB_FAVORITE_ADDED: 'lab_favorite_added',
  LAB_FAVORITE_REMOVED: 'lab_favorite_removed',

  // Review
  REVIEW_WRITE_STARTED: 'review_write_started',
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_HELPFUL_CLICKED: 'review_helpful_clicked',

  // Mock Interview
  MOCK_INTERVIEW_BOOKING_STARTED: 'mock_interview_booking_started',
  MOCK_INTERVIEW_LAB_SELECTED: 'mock_interview_lab_selected',
  MOCK_INTERVIEW_SLOT_SELECTED: 'mock_interview_slot_selected',
  MOCK_INTERVIEW_BOOKING_COMPLETED: 'mock_interview_booking_completed',
  MOCK_INTERVIEW_CANCELLED: 'mock_interview_cancelled',

  // Profile
  PROFILE_UPDATED: 'profile_updated',
  RESEARCH_INTERESTS_UPDATED: 'research_interests_updated',
};

/**
 * Track analytics event
 *
 * @param {string} name - Event name from AnalyticsEvents
 * @param {Object} payload - Event data payload
 *
 * @example
 * trackEvent(AnalyticsEvents.LAB_VIEWED, {
 *   labId: 123,
 *   univId: 45,
 *   from: 'search'
 * });
 */
export function trackEvent(name, payload = {}) {
  // 1) Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, payload);
  }

  // 2) Amplitude
  if (typeof window !== 'undefined' && window.amplitude) {
    window.amplitude.getInstance().logEvent(name, payload);
  }

  // 3) Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics Event]', name, payload);
  }

  // 4) You can add more analytics platforms here
  // - Mixpanel
  // - Segment
  // - Custom backend endpoint, etc.
}

/**
 * Track page view
 *
 * @param {string} path - Page path
 * @param {Object} additionalData - Additional tracking data
 */
export function trackPageView(path, additionalData = {}) {
  const payload = {
    path,
    referrer: document.referrer,
    ...additionalData,
  };

  // Extract UTM parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {};

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      utmParams[param] = value;
    }
  });

  trackEvent(AnalyticsEvents.PAGE_VIEW, { ...payload, ...utmParams });
}

/**
 * Track search event
 *
 * @param {string} keyword - Search keyword
 * @param {Object} filters - Applied filters
 */
export function trackSearch(keyword, filters = {}) {
  trackEvent(AnalyticsEvents.SEARCH_PERFORMED, {
    keyword,
    filters,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track filter change event
 *
 * @param {string} filterType - Type of filter changed
 * @param {any} filterValue - New filter value
 * @param {Object} allFilters - All current filters
 */
export function trackFilterChange(filterType, filterValue, allFilters = {}) {
  trackEvent(AnalyticsEvents.FILTER_CHANGED, {
    filterType,
    filterValue,
    allFilters,
  });
}

/**
 * Track lab view event
 *
 * @param {number} labId - Lab ID
 * @param {Object} metadata - Additional lab metadata
 */
export function trackLabView(labId, metadata = {}) {
  trackEvent(AnalyticsEvents.LAB_VIEWED, {
    labId,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track review submission
 *
 * @param {number} labId - Lab ID
 * @param {Object} reviewData - Review data (without sensitive info)
 */
export function trackReviewSubmit(labId, reviewData = {}) {
  trackEvent(AnalyticsEvents.REVIEW_SUBMITTED, {
    labId,
    ...reviewData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track mock interview booking
 *
 * @param {string} step - Booking step completed
 * @param {Object} data - Booking data
 */
export function trackMockInterviewBooking(step, data = {}) {
  const eventMap = {
    started: AnalyticsEvents.MOCK_INTERVIEW_BOOKING_STARTED,
    lab_selected: AnalyticsEvents.MOCK_INTERVIEW_LAB_SELECTED,
    slot_selected: AnalyticsEvents.MOCK_INTERVIEW_SLOT_SELECTED,
    completed: AnalyticsEvents.MOCK_INTERVIEW_BOOKING_COMPLETED,
    cancelled: AnalyticsEvents.MOCK_INTERVIEW_CANCELLED,
  };

  const eventName = eventMap[step];
  if (eventName) {
    trackEvent(eventName, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}

export default trackEvent;
