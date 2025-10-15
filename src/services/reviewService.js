// Review Service - Handles all review-related API calls and logic
import { ApiService } from './apiService';
import { Review, RatingCategory } from '../models/Review';

export class ReviewService {
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Get rating categories
  static async getRatingCategories() {
    const cacheKey = 'rating_categories';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await ApiService.get('/reviews/rating-categories/');
      const categories = response.map(categoryData => RatingCategory.fromAPI(categoryData));

      this.cache.set(cacheKey, {
        data: categories,
        timestamp: Date.now()
      });

      return categories;
    } catch (error) {
      console.warn('Failed to load rating categories from API, using defaults:', error);
      // Return default categories as fallback
      return RatingCategory.getDefaultCategories();
    }
  }

  // Submit a new review
  static async submitReview(reviewData) {
    try {
      // Ensure we have a Review instance
      const review = reviewData instanceof Review ? reviewData : new Review(reviewData);

      // Validate review data
      if (!review.isValid()) {
        throw new Error('Review data is invalid');
      }

      // Convert to API format
      const apiData = review.toAPIFormat();

      console.log('Submitting review:', apiData);

      const response = await ApiService.post('/reviews/', apiData, true); // requireAuth = true

      return Review.fromAPI(response);
    } catch (error) {
      console.error('Error submitting review:', error);

      if (error.statusCode === 401) {
        throw new Error('You must be logged in to submit a review');
      } else if (error.statusCode === 400) {
        // Try to extract specific validation errors
        try {
          const errorData = JSON.parse(error.message);
          const errorMessages = [];

          if (errorData.lab) errorMessages.push(`Lab: ${errorData.lab[0]}`);
          if (errorData.position) errorMessages.push(`Position: ${errorData.position[0]}`);
          if (errorData.duration) errorMessages.push(`Duration: ${errorData.duration[0]}`);
          if (errorData.rating) errorMessages.push(`Rating: ${errorData.rating[0]}`);
          if (errorData.review_text) errorMessages.push(`Review: ${errorData.review_text[0]}`);
          if (errorData.ratings_input) errorMessages.push(`Category Ratings: ${errorData.ratings_input[0]}`);

          if (errorMessages.length > 0) {
            throw new Error(errorMessages.join('; '));
          }
        } catch (parseError) {
          // Fall through to generic error
        }
        throw new Error('Invalid review data. Please check all fields and try again.');
      } else if (error.statusCode === 403) {
        throw new Error('You do not have permission to submit reviews');
      } else if (error.statusCode === 409) {
        throw new Error('You have already reviewed this lab');
      }

      throw new Error('Failed to submit review. Please try again.');
    }
  }

  // Get reviews for a specific lab
  static async getLabReviews(labId, page = 1, pageSize = 10) {
    try {
      const params = new URLSearchParams({
        lab: labId,
        page: page.toString(),
        page_size: pageSize.toString()
      });

      const response = await ApiService.get(`/reviews/?${params}`);

      return {
        results: response.results?.map(reviewData => Review.fromAPI(reviewData)) || [],
        count: response.count || 0,
        hasMore: !!response.next,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error fetching lab reviews:', error);
      throw new Error('Failed to load reviews');
    }
  }

  // Get user's reviews
  static async getUserReviews(page = 1, pageSize = 10) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      const response = await ApiService.get(`/reviews/my-reviews/?${params}`, true);

      return {
        results: response.results?.map(reviewData => Review.fromAPI(reviewData)) || [],
        count: response.count || 0,
        hasMore: !!response.next,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('Failed to load your reviews');
    }
  }

  // Update a review
  static async updateReview(reviewId, reviewData) {
    try {
      const review = reviewData instanceof Review ? reviewData : new Review(reviewData);

      if (!review.isValid()) {
        throw new Error('Review data is invalid');
      }

      const apiData = review.toAPIFormat();
      const response = await ApiService.put(`/reviews/${reviewId}/`, apiData, true);

      return Review.fromAPI(response);
    } catch (error) {
      console.error('Error updating review:', error);

      if (error.statusCode === 401) {
        throw new Error('You must be logged in to update reviews');
      } else if (error.statusCode === 403) {
        throw new Error('You can only update your own reviews');
      } else if (error.statusCode === 404) {
        throw new Error('Review not found');
      }

      throw new Error('Failed to update review. Please try again.');
    }
  }

  // Delete a review
  static async deleteReview(reviewId) {
    try {
      await ApiService.delete(`/reviews/${reviewId}/`, true);
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);

      if (error.statusCode === 401) {
        throw new Error('You must be logged in to delete reviews');
      } else if (error.statusCode === 403) {
        throw new Error('You can only delete your own reviews');
      } else if (error.statusCode === 404) {
        throw new Error('Review not found');
      }

      throw new Error('Failed to delete review. Please try again.');
    }
  }

  // Vote on a review (helpful/not helpful)
  static async voteOnReview(reviewId, isHelpful) {
    try {
      const response = await ApiService.post(`/reviews/${reviewId}/vote/`, {
        helpful: isHelpful
      }, true);

      return response;
    } catch (error) {
      console.error('Error voting on review:', error);

      if (error.statusCode === 401) {
        throw new Error('You must be logged in to vote on reviews');
      } else if (error.statusCode === 400) {
        throw new Error('You have already voted on this review');
      }

      throw new Error('Failed to vote on review. Please try again.');
    }
  }

  // Get review statistics for a lab
  static async getLabReviewStats(labId) {
    try {
      const response = await ApiService.get(`/reviews/stats/?lab=${labId}`);

      return {
        totalReviews: response.total_reviews || 0,
        averageRating: response.average_rating || 0,
        ratingDistribution: response.rating_distribution || {},
        categoryAverages: response.category_averages || {},
        recommendationRate: response.recommendation_rate || 0
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {},
        categoryAverages: {},
        recommendationRate: 0
      };
    }
  }

  // Search labs for review form
  static async searchLabsForReview(query, universityId = null, departmentId = null, researchGroupId = null) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (universityId) params.append('university', universityId);
      if (departmentId) params.append('department', departmentId);
      if (researchGroupId) params.append('research_group', researchGroupId);

      const response = await ApiService.get(`/labs/search/?${params}`);

      return response.results || [];
    } catch (error) {
      console.error('Error searching labs:', error);
      return [];
    }
  }

  // Get departments for a university
  static async getDepartmentsByUniversity(universityId) {
    try {
      const response = await ApiService.get(`/universities/${universityId}/departments/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  // Get research groups for a department
  static async getResearchGroupsByDepartment(departmentId) {
    try {
      const response = await ApiService.get(`/departments/${departmentId}/research-groups/`);
      return response.results || response || [];
    } catch (error) {
      console.error('Error fetching research groups:', error);
      return [];
    }
  }

  // Add new university
  static async addUniversity(universityData) {
    try {
      const response = await ApiService.post('/universities/', universityData, true);
      return response;
    } catch (error) {
      console.error('Error adding university:', error);

      if (error.statusCode === 400) {
        throw new Error('Invalid university data. Please check all fields.');
      } else if (error.statusCode === 409) {
        throw new Error('This university already exists.');
      }

      throw new Error('Failed to add university. Please try again.');
    }
  }

  // Add new department
  static async addDepartment(universityId, departmentData) {
    try {
      const response = await ApiService.post(`/universities/${universityId}/departments/`, departmentData, true);

      // Filter out cache invalidation messages from the response
      if (response && typeof response === 'object') {
        // Remove any cache-related messages that might confuse users
        const cleanResponse = { ...response };
        delete cleanResponse.cache_invalidated;
        delete cleanResponse.cache_messages;
        return cleanResponse;
      }

      return response;
    } catch (error) {
      console.error('Error adding department:', error);

      // Don't show cache invalidation messages to users
      if (error.message && error.message.includes('Invalidated')) {
        console.log('Cache invalidation message (hidden from user):', error.message);
        return { success: true, message: 'Department added successfully' };
      }

      if (error.statusCode === 400) {
        throw new Error('Invalid department data. Please check all fields.');
      } else if (error.statusCode === 409) {
        throw new Error('This department already exists in this university.');
      }

      throw new Error('Failed to add department. Please try again.');
    }
  }

  // Add new research group
  static async addResearchGroup(departmentId, researchGroupData) {
    try {
      const response = await ApiService.post('/research-groups/', {
        ...researchGroupData,
        department: departmentId
      }, true);
      return response;
    } catch (error) {
      console.error('Error adding research group:', error);

      if (error.statusCode === 400) {
        throw new Error('Invalid research group data. Please check all fields.');
      } else if (error.statusCode === 409) {
        throw new Error('This research group already exists in this department.');
      }

      throw new Error('Failed to add research group. Please try again.');
    }
  }

  // Add new lab
  static async addLab(labData) {
    try {
      const response = await ApiService.post('/labs/', labData, true);
      return response;
    } catch (error) {
      console.error('Error adding lab:', error);

      if (error.statusCode === 400) {
        throw new Error('Invalid lab data. Please check all fields including website.');
      } else if (error.statusCode === 409) {
        throw new Error('This lab already exists.');
      }

      throw new Error('Failed to add lab. Please try again.');
    }
  }

  // Verify website domain (for academic institutions)
  static isAcademicDomain(website) {
    if (!website) return false;

    const academicDomains = [
      '.edu', '.ac.', '.edu.', '.university', '.college',
      '.mit.edu', '.stanford.edu', '.harvard.edu', '.berkeley.edu',
      '.cmu.edu', '.caltech.edu', '.ox.ac.uk', '.cam.ac.uk'
    ];

    const domain = website.toLowerCase();
    return academicDomains.some(suffix => domain.includes(suffix));
  }

  // Clear cache
  static clearCache() {
    this.cache.clear();
  }

  // Validate review form data
  static validateReviewForm(formData) {
    const errors = {};

    if (!formData.university) {
      errors.university = 'Please select a university';
    }

    if (!formData.lab) {
      errors.lab = 'Please select a lab';
    }

    if (!formData.position) {
      errors.position = 'Please select your position';
    }

    if (!formData.duration) {
      errors.duration = 'Please select your duration';
    }

    if (!formData.rating || formData.rating < 0.5 || formData.rating > 5.0) {
      errors.rating = 'Please provide a rating between 0.5 and 5.0';
    }

    if (!formData.reviewText) {
      errors.reviewText = 'Please write a review';
    } else if (formData.reviewText.length < 50) {
      errors.reviewText = 'Review must be at least 50 characters long';
    } else if (formData.reviewText.length > 2000) {
      errors.reviewText = 'Review must be less than 2000 characters';
    }

    // Validate category ratings
    if (formData.categoryRatings) {
      Object.entries(formData.categoryRatings).forEach(([category, rating]) => {
        if (rating < 0.5 || rating > 5.0) {
          errors[`category_${category}`] = `${category} rating must be between 0.5 and 5.0`;
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}