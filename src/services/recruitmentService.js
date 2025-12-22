// Recruitment Service for managing lab recruitment information
import { ApiService } from './apiService';

export class RecruitmentService {
  // Get recruitment status for a lab
  static async getRecruitmentStatus(labId) {
    try {
      const response = await ApiService.get(`/labs/${labId}/recruitment/`, false);
      return response;
    } catch (error) {
      console.error('Error fetching recruitment status:', error);
      throw error;
    }
  }

  // Update recruitment status for a lab
  static async updateRecruitmentStatus(labId, recruitmentData) {
    try {
      const payload = {
        is_recruiting_phd: recruitmentData.phd || false,
        is_recruiting_postdoc: recruitmentData.postdoc || false,
        is_recruiting_intern: recruitmentData.intern || false,
        notes: recruitmentData.notes || ''
      };

      const response = await ApiService.patch(
        `/labs/${labId}/recruitment/`,
        payload,
        true
      );
      return response;
    } catch (error) {
      console.error('Error updating recruitment status:', error);
      throw error;
    }
  }

  // Create recruitment status for a lab (if doesn't exist)
  static async createRecruitmentStatus(labId, recruitmentData) {
    try {
      const payload = {
        lab: labId,
        is_recruiting_phd: recruitmentData.phd || false,
        is_recruiting_postdoc: recruitmentData.postdoc || false,
        is_recruiting_intern: recruitmentData.intern || false,
        notes: recruitmentData.notes || ''
      };

      const response = await ApiService.post(
        `/labs/${labId}/recruitment/`,
        payload,
        true
      );
      return response;
    } catch (error) {
      console.error('Error creating recruitment status:', error);
      throw error;
    }
  }
}
