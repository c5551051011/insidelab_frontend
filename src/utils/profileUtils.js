/**
 * Profile utility functions for formatting, validation, and common operations
 */

/**
 * Get user initials from name
 * @param {string} name - User's full name
 * @returns {string} User initials (first letter of name or 'U' as default)
 */
export const getInitials = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U';
};

/**
 * Format date and time for session displays
 * @param {string} dateTime - ISO date string
 * @returns {object} Formatted date information
 */
export const formatDate = (dateTime) => {
  const date = new Date(dateTime);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    fullDate: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };
};

/**
 * Format simple date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatSimpleDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get session type label from type code
 * @param {string} type - Session type code
 * @returns {string} Human-readable session type label
 */
export const getSessionTypeLabel = (type) => {
  switch (type) {
    case 'mock_interview': return 'Mock Interview';
    case 'cv_review': return 'CV Review';
    case 'research_consultation': return 'Research Consultation';
    case 'phd_guidance': return 'PhD Guidance';
    case 'career_advice': return 'Career Advice';
    default: return 'Session';
  }
};

/**
 * Get verification status information
 * @param {string} status - Verification status code
 * @param {function} t - Translation function
 * @returns {object} Status text and color information
 */
export const getVerificationStatus = (status) => {
  switch (status || 'unverified') {
    case 'verified':
      return {
        text: 'Verified',
        color: '#10B981',
        icon: 'CheckCircle'
      };
    case 'pending':
      return {
        text: 'Verification Pending',
        color: '#F59E0B',
        icon: 'Clock'
      };
    case 'unverified':
    default:
      return {
        text: 'Unverified',
        color: '#6B7280',
        icon: 'Shield'
      };
  }
};

/**
 * Get status color for session status
 * @param {string} status - Session status
 * @returns {string} Color code for status
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return '#10B981';
    case 'pending':
      return '#F59E0B';
    case 'completed':
      return '#3B82F6';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

/**
 * Calculate rating statistics
 * @param {Array} reviews - Array of review objects
 * @returns {object} Rating statistics
 */
export const calculateRatingStats = (reviews = []) => {
  if (!reviews.length) {
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / total;

  const distribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  return { average, total, distribution };
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Format currency amount
 * @param {number} amount - Amount in cents/smallest currency unit
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount / 100); // Assuming amount is in cents
};

/**
 * Check if user is a service provider
 * @param {object} user - User object
 * @returns {boolean} True if user is a service provider
 */
export const isServiceProvider = (user) => {
  return user?.isProvider === true || user?.providerProfile?.isActive === true;
};

/**
 * Get academic level display text
 * @param {string} level - Academic level code
 * @returns {string} Display text for academic level
 */
export const getAcademicLevelText = (level) => {
  switch (level) {
    case 'undergraduate': return 'Undergraduate';
    case 'graduate': return 'Graduate';
    case 'postgraduate': return 'Postgraduate';
    case 'phd': return 'PhD';
    case 'postdoc': return 'Postdoc';
    case 'faculty': return 'Faculty';
    default: return level || 'Not specified';
  }
};