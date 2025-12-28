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

  // Get all active recruitment listings
  static async getActiveRecruitments(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add filters if provided
      if (params.recruiting_phd) queryParams.append('recruiting_phd', 'true');
      if (params.recruiting_postdoc) queryParams.append('recruiting_postdoc', 'true');
      if (params.recruiting_intern) queryParams.append('recruiting_intern', 'true');
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);

      const url = `/labs/recruitment/?${queryParams.toString()}`;
      console.log('Fetching recruitments from:', url);

      const response = await ApiService.get(url, false);
      console.log('Recruitment API response:', response);

      // Transform the data to include lab information
      const recruitments = response.results || response || [];

      return recruitments.map(recruitment => ({
        id: recruitment.id,
        labId: recruitment.lab_id || recruitment.lab,
        labName: recruitment.lab_name || 'Unknown Lab',
        professorName: recruitment.professor_name || 'Unknown Professor',
        universityName: recruitment.university_name || 'Unknown University',
        department: recruitment.department_name || recruitment.department || 'Unknown Department',
        researchAreas: recruitment.research_areas || [],
        overallRating: parseFloat(recruitment.overall_rating || 0),
        reviewCount: parseInt(recruitment.review_count || 0),
        isRecruitingPhd: recruitment.is_recruiting_phd || false,
        isRecruitingPostdoc: recruitment.is_recruiting_postdoc || false,
        isRecruitingIntern: recruitment.is_recruiting_intern || false,
        notes: recruitment.notes || '',
        updatedAt: recruitment.updated_at || recruitment.created_at,
        website: recruitment.website || ''
      }));
    } catch (error) {
      console.error('Error fetching recruitment data:', error);
      return []; // Return empty array on error
    }
  }
}
