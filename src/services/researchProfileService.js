// Research Profile Service - Handles research profile API operations
import { AuthService } from './authService';
import { ApiService } from './apiService';

const API_BASE_URL = 'https://insidelab.up.railway.app/api/v1';

export class ResearchProfileService {
  /**
   * Get current user's research profile
   * @returns {Promise<Object|null>} Research profile data or null if not exists
   */
  static async getResearchProfile() {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/user/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const userData = await response.json();
      return userData.research_profile || null;
    } catch (error) {
      console.error('Error fetching research profile:', error);
      throw error;
    }
  }

  /**
   * Create a new research profile
   * @param {Object} profileData - Research profile data
   * @param {string} profileData.primary_research_area - Primary research area
   * @param {Array<string>} profileData.specialties_interests - Specialties and interests
   * @param {Array<string>} profileData.research_keywords - Research keywords
   * @param {string} profileData.academic_background - Academic background
   * @param {string} profileData.research_goals - Research goals
   * @returns {Promise<Object>} Created research profile
   */
  static async createResearchProfile(profileData) {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/research-profile/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating research profile:', error);
      throw error;
    }
  }

  /**
   * Update research profile (full update)
   * @param {number} profileId - Profile ID
   * @param {Object} profileData - Complete research profile data
   * @returns {Promise<Object>} Updated research profile
   */
  static async updateResearchProfile(profileId, profileData) {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/research-profile/${profileId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating research profile:', error);
      throw error;
    }
  }

  /**
   * Partially update research profile
   * @param {number} profileId - Profile ID
   * @param {Object} partialData - Partial research profile data
   * @returns {Promise<Object>} Updated research profile
   */
  static async patchResearchProfile(profileId, partialData) {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/research-profile/${profileId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(partialData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error patching research profile:', error);
      throw error;
    }
  }

  /**
   * Delete research profile
   * @param {number} profileId - Profile ID
   * @returns {Promise<void>}
   */
  static async deleteResearchProfile(profileId) {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/research-profile/${profileId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting research profile:', error);
      throw error;
    }
  }

  /**
   * Create or update research profile (convenience method)
   * @param {Object} profileData - Research profile data
   * @returns {Promise<Object>} Created or updated research profile
   */
  static async saveResearchProfile(profileData) {
    try {
      // First, try to get the current user to see if they have a research profile
      const currentUser = await AuthService.getCurrentUser();

      if (currentUser.research_profile && currentUser.research_profile.id) {
        // Update existing profile
        return await this.updateResearchProfile(currentUser.research_profile.id, profileData);
      } else {
        // Create new profile
        return await this.createResearchProfile(profileData);
      }
    } catch (error) {
      console.error('Error saving research profile:', error);
      throw error;
    }
  }

  /**
   * Transform frontend data to API format
   * @param {Object} frontendData - Data from the frontend form
   * @param {string} frontendData.researchArea - Primary research area
   * @param {Array<string>} frontendData.specialties - Specialties array
   * @param {Array<string>} frontendData.keywords - Keywords array
   * @param {string} frontendData.academicBackground - Academic background
   * @param {string} frontendData.researchGoals - Research goals
   * @returns {Object} API-formatted data
   */
  static transformToApiFormat(frontendData) {
    return {
      primary_research_area: frontendData.researchArea || '',
      specialties_interests: frontendData.specialties || [],
      research_keywords: frontendData.keywords || [],
      academic_background: frontendData.academicBackground || '',
      research_goals: frontendData.researchGoals || ''
    };
  }

  /**
   * Transform API data to frontend format
   * @param {Object} apiData - Data from the API
   * @returns {Object} Frontend-formatted data
   */
  static transformFromApiFormat(apiData) {
    if (!apiData) return null;

    return {
      id: apiData.id,
      researchArea: apiData.primary_research_area || '',
      specialties: apiData.specialties_interests || [],
      keywords: apiData.research_keywords || [],
      academicBackground: apiData.academic_background || '',
      researchGoals: apiData.research_goals || '',
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at
    };
  }
}