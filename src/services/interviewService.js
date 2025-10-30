// Interview Service - Handles mock interview API operations
import { ApiService } from './apiService';

const API_BASE_URL = 'https://insidelab.up.railway.app/api/v1';

export class InterviewService {
  /**
   * Get all interview sessions for current user
   */
  static async getInterviewSessions() {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/interviews/`, {
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
        throw new Error(errorData.detail || `API request failed: ${response.status}`);
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
   * Update interview session status
   */
  static async updateInterviewSession(sessionId, updateData) {
    try {
      const token = ApiService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/interviews/${sessionId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating interview session:', error);
      throw error;
    }
  }

  /**
   * Transform frontend booking data to API format
   */
  static transformBookingToApiFormat(bookingData) {
    const { sessionType, preferredSlots, focusAreas, additionalNotes } = bookingData;

    // Get the first available slot
    const firstSlot = preferredSlots.find(slot => slot.date && slot.time);

    if (!firstSlot) {
      throw new Error('At least one time slot is required');
    }

    return {
      session_type: sessionType === 'mock-interview' ? 'mock_interview' : 'qa_session',
      preferred_date: firstSlot.date,
      preferred_time: firstSlot.time + ':00', // Add seconds
      duration_minutes: sessionType === 'mock-interview' ? 60 : 30,
      research_area: focusAreas || 'General',
      notes: additionalNotes || ''
    };
  }
}