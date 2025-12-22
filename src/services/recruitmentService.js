// Recruitment Service for managing lab recruitment information
import { ApiService } from './apiService';

export class RecruitmentService {
  // Get recruitment status for a lab
  static async getRecruitmentStatus(labId) {
    try {
      const response = await ApiService.get(`/labs/recruitment/${labId}/`, false);
      return response;
    } catch (error) {
      console.error('Error fetching recruitment status:', error);
      throw error;
    }
  }

  // Create recruitment status for a lab (POST /api/v1/labs/recruitment/)
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
        '/labs/recruitment/',
        payload,
        true
      );
      return response;
    } catch (error) {
      console.error('Error creating recruitment status:', error);
      throw error;
    }
  }

  // Fully update recruitment status (PUT /api/v1/labs/recruitment/{lab_id}/)
  static async replaceRecruitmentStatus(labId, recruitmentData) {
    try {
      const payload = {
        lab: labId,
        is_recruiting_phd: recruitmentData.phd || false,
        is_recruiting_postdoc: recruitmentData.postdoc || false,
        is_recruiting_intern: recruitmentData.intern || false,
        notes: recruitmentData.notes || ''
      };

      const response = await ApiService.put(
        `/labs/recruitment/${labId}/`,
        payload,
        true
      );
      return response;
    } catch (error) {
      console.error('Error replacing recruitment status:', error);
      throw error;
    }
  }

  // Partially update recruitment status (PATCH /api/v1/labs/recruitment/{lab_id}/)
  static async updateRecruitmentStatus(labId, recruitmentData) {
    try {
      const payload = {
        is_recruiting_phd: recruitmentData.phd || false,
        is_recruiting_postdoc: recruitmentData.postdoc || false,
        is_recruiting_intern: recruitmentData.intern || false,
        notes: recruitmentData.notes || ''
      };

      const response = await ApiService.patch(
        `/labs/recruitment/${labId}/`,
        payload,
        true
      );
      return response;
    } catch (error) {
      console.error('Error updating recruitment status:', error);
      throw error;
    }
  }
}
