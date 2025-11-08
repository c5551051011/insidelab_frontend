// Interview Service - Handles mock interview API operations
import { ApiService } from './apiService';

const API_BASE_URL = 'https://insidelab.up.railway.app/api/v1';

export class InterviewService {
  /**
   * Get all research areas
   */
  static async getResearchAreas() {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/research-areas/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching research areas:', error);
      throw error;
    }
  }

  /**
   * Get all interview sessions for current user
   */
  static async getInterviewSessions(params = {}) {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.ordering) queryParams.append('ordering', params.ordering);

      const url = `${API_BASE_URL}/interviews/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching interview sessions:', error);
      throw error;
    }
  }

  /**
   * Get upcoming sessions
   */
  static async getUpcomingSessions() {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/interviews/upcoming/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      throw error;
    }
  }

  /**
   * Get past sessions
   */
  static async getPastSessions() {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/interviews/past/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching past sessions:', error);
      throw error;
    }
  }

  /**
   * Create a new interview session
   */
  static async createInterviewSession(sessionData) {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/interviews/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || JSON.stringify(errorData) || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating interview session:', error);
      throw error;
    }
  }

  /**
   * Get specific interview session by ID
   */
  static async getInterviewSession(sessionId) {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/interviews/${sessionId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching interview session:', error);
      throw error;
    }
  }

  /**
   * Cancel an interview session
   */
  static async cancelInterviewSession(sessionId) {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/interviews/${sessionId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling interview session:', error);
      throw error;
    }
  }

  /**
   * Transform frontend booking data to API format
   */
  static transformBookingToApiFormat(bookingData) {
    const { sessionType, selectedLabs, researchAreaIds, focusAreas, preferredSlots, additionalNotes, totalPrice } = bookingData;

    // Transform slots to API format
    const apiSlots = preferredSlots
      .filter(slot => slot.date && slot.startTime && slot.endTime)
      .map((slot, index) => ({
        date: slot.date,
        time: `${slot.startTime}:00`,  // HH:MM:SS 형식으로 변환 (시작 시간 사용)
        priority: index + 1
      }));

    if (apiSlots.length === 0) {
      throw new Error('At least one time slot is required');
    }

    const apiData = {
      session_type: sessionType,
      selected_labs: selectedLabs || [],
      focus_areas: focusAreas || '',
      preferred_slots: apiSlots,
      additional_notes: additionalNotes || '',
      total_price: totalPrice || 0
    };

    // Add research areas if provided
    if (researchAreaIds && researchAreaIds.length > 0) {
      apiData.selected_research_areas = researchAreaIds;
    }

    return apiData;
  }
}