// Bookmark Service for lab/professor interest management
import { ApiService } from './apiService';

export const InterestType = {
  GENERAL: 'general',
  APPLICATION: 'application',
  WATCHING: 'watching',
  RECRUITED: 'recruited'
};

export const InterestConfig = {
  [InterestType.GENERAL]: {
    label: 'General Interest',
    icon: 'Bookmark',
    color: '#2563eb'
  },
  [InterestType.APPLICATION]: {
    label: 'Want to Apply',
    icon: 'Send',
    color: '#f59e0b'
  },
  [InterestType.WATCHING]: {
    label: 'Watching',
    icon: 'Eye',
    color: '#06b6d4'
  },
  [InterestType.RECRUITED]: {
    label: 'Recruited',
    icon: 'UserCheck',
    color: '#10b981'
  }
};

class BookmarkService {
  // Get all lab interests for the current user
  static async getLabInterests() {
    try {
      console.log('DEBUG: Fetching lab interests');
      const response = await ApiService.get('/auth/lab-interests/', true);
      console.log('DEBUG: Lab interests response:', response);

      if (Array.isArray(response)) {
        return response.map(json => ({
          id: json.id,
          labId: json.lab.toString(),
          labName: json.lab_name,
          labProfessor: json.lab_professor,
          labUniversity: json.lab_university,
          labDepartment: json.lab_department,
          labRating: parseFloat(json.lab_rating),
          interestType: json.interest_type,
          notes: json.notes,
          createdAt: new Date(json.created_at)
        }));
      }
      return [];
    } catch (e) {
      console.log('DEBUG: Error fetching lab interests:', e);
      return [];
    }
  }

  // Get lab interests summary grouped by type
  static async getLabInterestsSummary() {
    try {
      const response = await ApiService.get('/auth/lab-interests/summary/', true);
      return response;
    } catch (e) {
      console.log('DEBUG: Error fetching lab interests summary:', e);
      return null;
    }
  }

  // Add or update lab interest
  static async toggleLabInterest(labId, interestType = InterestType.GENERAL, notes = null) {
    try {
      console.log('DEBUG: Toggling lab interest:', { labId, interestType, notes });

      const response = await ApiService.post('/auth/lab-interests/toggle_interest/', {
        lab_id: parseInt(labId),
        interest_type: interestType,
        ...(notes && { notes })
      }, true);

      console.log('DEBUG: Toggle interest response:', response);

      // Handle the response format: {"action": "added", "interest": {...}}
      if (response && typeof response === 'object' && response.interest) {
        const interest = response.interest;
        return {
          id: interest.id,
          labId: interest.lab.toString(),
          labName: interest.lab_name,
          labProfessor: interest.lab_professor,
          labUniversity: interest.lab_university,
          labDepartment: interest.lab_department,
          labRating: parseFloat(interest.lab_rating),
          interestType: interest.interest_type,
          notes: interest.notes,
          createdAt: new Date(interest.created_at),
          action: response.action // 'added' or 'updated'
        };
      }

      // Fallback: try to parse response directly
      return {
        id: response.id,
        labId: response.lab.toString(),
        labName: response.lab_name,
        labProfessor: response.lab_professor,
        labUniversity: response.lab_university,
        labDepartment: response.lab_department,
        labRating: parseFloat(response.lab_rating),
        interestType: response.interest_type,
        notes: response.notes,
        createdAt: new Date(response.created_at)
      };
    } catch (e) {
      console.log('DEBUG: Error toggling lab interest:', e);
      return null;
    }
  }

  // Remove lab interest
  static async removeLabInterest(labId) {
    try {
      console.log('DEBUG: Removing lab interest:', labId);
      await ApiService.delete(`/auth/lab-interests/remove_interest/?lab_id=${labId}`, true);
      return true;
    } catch (e) {
      console.log('DEBUG: Error removing lab interest:', e);
      return false;
    }
  }

  // Get interested lab IDs for batch checking
  static async getInterestedLabIds() {
    try {
      const interests = await this.getLabInterests();
      return new Set(interests.map(interest => interest.labId));
    } catch (e) {
      console.log('DEBUG: Error fetching interested lab IDs:', e);
      return new Set();
    }
  }

  // Check if a lab has any interest and return the interest object
  static async getLabInterest(labId) {
    try {
      const interests = await this.getLabInterests();
      return interests.find(interest => interest.labId === labId) || null;
    } catch (e) {
      console.log('DEBUG: Error checking lab interest:', e);
      return null;
    }
  }

  // Update interest type for existing interest
  static async updateInterestType(labId, newInterestType) {
    try {
      const result = await this.toggleLabInterest(labId, newInterestType);
      return result !== null;
    } catch (e) {
      console.log('DEBUG: Error updating interest type:', e);
      return false;
    }
  }

  // Simple save/unsave functionality (uses general interest type)
  static async toggleSimpleSave(labId) {
    try {
      const currentInterest = await this.getLabInterest(labId);

      if (currentInterest) {
        // Remove if exists
        return await this.removeLabInterest(labId);
      } else {
        // Add with general interest type
        const result = await this.toggleLabInterest(labId, InterestType.GENERAL);
        return result !== null;
      }
    } catch (e) {
      console.log('DEBUG: Error in simple toggle save:', e);
      return false;
    }
  }

  // Check if lab is saved (has any interest type)
  static async isLabSaved(labId) {
    try {
      const interest = await this.getLabInterest(labId);
      return interest !== null;
    } catch (e) {
      console.log('DEBUG: Error checking if lab is saved:', e);
      return false;
    }
  }
}

export { BookmarkService };