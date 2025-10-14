// Review Model - Data model for review entities
export class Review {
  constructor(data = {}) {
    this.id = data.id;
    this.labId = data.labId || data.lab_id;
    this.userId = data.userId || data.user_id;
    this.position = data.position || '';
    this.duration = data.duration || '';
    this.reviewDate = data.reviewDate || data.review_date || new Date();
    this.rating = data.rating || 0;
    this.categoryRatings = data.categoryRatings || data.category_ratings || data.ratings_input || {};
    this.reviewText = data.reviewText || data.review_text || '';
    this.pros = Array.isArray(data.pros) ? data.pros : (data.pros ? [data.pros] : []);
    this.cons = Array.isArray(data.cons) ? data.cons : (data.cons ? [data.cons] : []);
    this.helpfulCount = data.helpfulCount || data.helpful_count || 0;
    this.userVote = data.userVote || data.user_vote || null;
    this.isVerified = data.isVerified || data.is_verified || false;
    this.createdAt = data.createdAt || data.created_at || null;
    this.updatedAt = data.updatedAt || data.updated_at || null;
  }

  // Get formatted rating
  getFormattedRating(decimals = 1) {
    return this.rating.toFixed(decimals);
  }

  // Get rating description
  getRatingDescription() {
    if (this.rating >= 4.5) return 'Excellent';
    if (this.rating >= 3.5) return 'Good';
    if (this.rating >= 2.5) return 'Average';
    if (this.rating >= 1.5) return 'Below Average';
    return 'Poor';
  }

  // Get rating color
  getRatingColor() {
    if (this.rating >= 4.5) return '#10B981'; // Green
    if (this.rating >= 3.5) return '#3B82F6'; // Blue
    if (this.rating >= 2.5) return '#F59E0B'; // Yellow
    if (this.rating >= 1.5) return '#F97316'; // Orange
    return '#EF4444'; // Red
  }

  // Get average category rating
  getAverageCategoryRating() {
    const ratings = Object.values(this.categoryRatings);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  // Get formatted date
  getFormattedDate() {
    const date = new Date(this.reviewDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Check if review is recent (within last 30 days)
  isRecent() {
    const now = new Date();
    const reviewDate = new Date(this.reviewDate);
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }

  // Validate review data
  isValid() {
    return this.labId &&
           this.position &&
           this.duration &&
           this.rating >= 0.5 &&
           this.rating <= 5.0 &&
           this.reviewText &&
           this.reviewText.length >= 50;
  }

  // Convert to API format
  toAPIFormat() {
    return {
      lab: parseInt(this.labId),
      position: this.position,
      duration: this.duration,
      rating: this.rating,
      ratings_input: this.categoryRatings,
      review_text: this.reviewText,
      pros: this.pros,
      cons: this.cons
    };
  }

  // Create from API response
  static fromAPI(apiData) {
    return new Review(apiData);
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      labId: this.labId,
      userId: this.userId,
      position: this.position,
      duration: this.duration,
      reviewDate: this.reviewDate,
      rating: this.rating,
      categoryRatings: this.categoryRatings,
      reviewText: this.reviewText,
      pros: this.pros,
      cons: this.cons,
      helpfulCount: this.helpfulCount,
      userVote: this.userVote,
      isVerified: this.isVerified
    };
  }
}

// Review Form Data Model
export class ReviewFormData {
  constructor(data = {}) {
    this.university = data.university || '';
    this.department = data.department || '';
    this.researchGroup = data.researchGroup || '';
    this.lab = data.lab || '';
    this.position = data.position || '';
    this.duration = data.duration || '';
    this.rating = data.rating || 0;
    this.categoryRatings = data.categoryRatings || {};
    this.reviewText = data.reviewText || '';
    this.pros = data.pros || '';
    this.cons = data.cons || '';
  }

  // Validate form data
  validate() {
    const errors = {};

    if (!this.university) errors.university = 'University is required';
    if (!this.lab) errors.lab = 'Lab selection is required';
    if (!this.position) errors.position = 'Position is required';
    if (!this.duration) errors.duration = 'Duration is required';
    if (this.rating < 0.5 || this.rating > 5.0) errors.rating = 'Rating must be between 0.5 and 5.0';
    if (!this.reviewText) {
      errors.reviewText = 'Review text is required';
    } else if (this.reviewText.length < 50) {
      errors.reviewText = 'Review text must be at least 50 characters';
    } else if (this.reviewText.length > 2000) {
      errors.reviewText = 'Review text must be less than 2000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Check if form is complete
  isComplete() {
    return this.validate().isValid;
  }

  // Convert to Review instance
  toReview() {
    return new Review({
      labId: this.lab,
      position: this.position,
      duration: this.duration,
      rating: this.rating,
      categoryRatings: this.categoryRatings,
      reviewText: this.reviewText,
      pros: this.pros ? this.pros.split('\n').filter(p => p.trim()) : [],
      cons: this.cons ? this.cons.split('\n').filter(c => c.trim()) : []
    });
  }

  // Reset form data
  reset() {
    this.university = '';
    this.department = '';
    this.researchGroup = '';
    this.lab = '';
    this.position = '';
    this.duration = '';
    this.rating = 0;
    this.categoryRatings = {};
    this.reviewText = '';
    this.pros = '';
    this.cons = '';
  }

  // Convert to plain object
  toJSON() {
    return {
      university: this.university,
      department: this.department,
      researchGroup: this.researchGroup,
      lab: this.lab,
      position: this.position,
      duration: this.duration,
      rating: this.rating,
      categoryRatings: this.categoryRatings,
      reviewText: this.reviewText,
      pros: this.pros,
      cons: this.cons
    };
  }
}

// Rating Category Model
export class RatingCategory {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name || '';
    this.description = data.description || '';
    this.order = data.order || 0;
    this.isRequired = data.isRequired || data.is_required || false;
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      order: this.order,
      isRequired: this.isRequired
    };
  }

  // Create from API response
  static fromAPI(apiData) {
    return new RatingCategory(apiData);
  }

  // Get default categories (fallback)
  static getDefaultCategories() {
    return [
      new RatingCategory({
        id: 1,
        name: 'Research Environment',
        description: 'Quality of research facilities and resources',
        order: 1,
        isRequired: true
      }),
      new RatingCategory({
        id: 2,
        name: 'Advisor Support',
        description: 'Mentorship and guidance from advisor',
        order: 2,
        isRequired: true
      }),
      new RatingCategory({
        id: 3,
        name: 'Work-Life Balance',
        description: 'Balance between work demands and personal life',
        order: 3,
        isRequired: true
      }),
      new RatingCategory({
        id: 4,
        name: 'Career Support',
        description: 'Support for career development and opportunities',
        order: 4,
        isRequired: true
      }),
      new RatingCategory({
        id: 5,
        name: 'Funding & Resources',
        description: 'Availability of funding and research resources',
        order: 5,
        isRequired: true
      }),
      new RatingCategory({
        id: 6,
        name: 'Lab Culture',
        description: 'Overall lab environment and team dynamics',
        order: 6,
        isRequired: true
      }),
      new RatingCategory({
        id: 7,
        name: 'Mentorship Quality',
        description: 'Quality of mentorship and training received',
        order: 7,
        isRequired: true
      })
    ];
  }
}

// Position Options
export const POSITION_OPTIONS = [
  'PhD Student',
  'MS Student',
  'Undergrad',
  'PostDoc',
  'Research Assistant',
  'faculty'
];

// Duration Options
export const DURATION_OPTIONS = [
  '< 6 months',
  '6 months',
  '1 year',
  '2 years',
  '3 years',
  '4+ years'
];

// Validation Constants
export const VALIDATION_RULES = {
  REVIEW_TEXT_MIN_LENGTH: 50,
  REVIEW_TEXT_MAX_LENGTH: 2000,
  RATING_MIN: 0.5,
  RATING_MAX: 5.0,
  RATING_STEP: 0.5
};