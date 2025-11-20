// University Service for university operations
import { ApiService } from './apiService';

class UniversityService {
  static async getAllUniversities(search = '') {
    try {
      const baseEndpoint = search ? `/universities/?search=${encodeURIComponent(search)}` : '/universities/';
      const endpoint = search ? `${baseEndpoint}&fields=minimal` : `${baseEndpoint}?fields=minimal`;
      console.log('🔥 API Call:', `https://insidelab.up.railway.app/api/v1${endpoint}`);

      const response = await ApiService.get(endpoint);
      console.log('✅ API Response successful:', response);
      console.log('📊 University count from DB:', (response.results || response).length);

      return response.results || response;
    } catch (error) {
      console.error('❌ API Call failed:', error);
      console.log('🔍 Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack
      });
      console.log('📋 Using fallback universities instead');

      // Return fallback universities if API fails
      return [
        { id: '1', name: 'MIT', website: 'https://mit.edu' },
        { id: '2', name: 'Stanford University', website: 'https://stanford.edu' },
        { id: '3', name: 'Harvard University', website: 'https://harvard.edu' },
        { id: '4', name: 'UC Berkeley', website: 'https://berkeley.edu' },
        { id: '5', name: 'Carnegie Mellon University', website: 'https://cmu.edu' },
        { id: '6', name: 'Georgia Tech', website: 'https://gatech.edu' },
        { id: '7', name: 'University of Washington', website: 'https://washington.edu' },
        { id: '8', name: 'University of Illinois', website: 'https://illinois.edu' },
        { id: '9', name: 'Cornell University', website: 'https://cornell.edu' },
        { id: '10', name: 'Princeton University', website: 'https://princeton.edu' },
      ];
    }
  }

  static async searchUniversities(query) {
    try {
      return await this.getAllUniversities(query);
    } catch (error) {
      console.log('DEBUG: Error searching universities:', error);
      return [];
    }
  }

  static async addUniversity(universityData) {
    try {
      console.log('🔥 Adding university with data:', universityData);
      const response = await ApiService.post('/universities/', universityData);
      console.log('✅ University added successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error adding university:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        response: error.response
      });

      // Re-throw the error instead of returning mock data
      throw new Error(`Failed to add university: ${error.message}`);
    }
  }

  // Get all departments globally (new approach)
  static async getAllDepartments() {
    try {
      console.log('🔥 API Call: https://insidelab.up.railway.app/api/v1/departments/?fields=minimal');
      const response = await ApiService.get('/departments/?fields=minimal');
      console.log('✅ All departments response:', response);
      return response.results || response;
    } catch (error) {
      console.error('❌ Error fetching all departments:', error);
      return [];
    }
  }

  static async getDepartmentsByUniversity(universityId) {
    try {
      const response = await ApiService.get(`/universities/${universityId}/departments/?fields=minimal`);
      return response.results || response;
    } catch (error) {
      console.log('DEBUG: Error fetching departments:', error);
      // Return fallback departments
      return [
        { id: '1', name: 'Computer Science', university_id: universityId },
        { id: '2', name: 'Electrical Engineering', university_id: universityId },
        { id: '3', name: 'Mechanical Engineering', university_id: universityId },
        { id: '4', name: 'Biology', university_id: universityId },
        { id: '5', name: 'Chemistry', university_id: universityId },
        { id: '6', name: 'Physics', university_id: universityId },
        { id: '7', name: 'Mathematics', university_id: universityId },
        { id: '8', name: 'Statistics', university_id: universityId },
        { id: '9', name: 'Bioengineering', university_id: universityId },
        { id: '10', name: 'Materials Science', university_id: universityId },
      ];
    }
  }

  static async addDepartment(universityId, departmentData) {
    try {
      console.log(`🔥 Adding department to university ${universityId}:`, departmentData);
      const response = await ApiService.post(`/universities/${universityId}/departments/`, departmentData);
      console.log('✅ Department added to university:', response);
      return response;
    } catch (error) {
      console.error('❌ Error adding department:', error);
      throw new Error(`Failed to add department: ${error.message}`);
    }
  }

  // Get research groups for a university department
  static async getResearchGroupsByDepartment(universityDepartmentId) {
    try {
      console.log(`🔥 Loading research groups for university department ${universityDepartmentId}`);
      const response = await ApiService.get(`/universities/research-groups/?university_department=${universityDepartmentId}&fields=minimal`);
      console.log('✅ Research groups loaded:', response);
      return response.results || response;
    } catch (error) {
      console.error('❌ Error loading research groups:', error);
      return [];
    }
  }

  // Add research group
  static async addResearchGroup(researchGroupData) {
    try {
      console.log('🔥 Adding research group:', researchGroupData);
      const response = await ApiService.post('/universities/research-groups/', researchGroupData);
      console.log('✅ Research group added:', response);
      return response;
    } catch (error) {
      console.error('❌ Error adding research group:', error);
      throw new Error(`Failed to add research group: ${error.message}`);
    }
  }

  // Get professors with lab information
  static async getProfessors(filters = {}) {
    try {
      let endpoint = '/professors/?fields=minimal';

      // Add filters
      const params = new URLSearchParams();
      if (filters.university) {
        params.append('university', filters.university);
      }
      if (filters.university_department) {
        params.append('university_department', filters.university_department);
      }
      if (filters.research_group) {
        params.append('research_group', filters.research_group);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      if (params.toString()) {
        endpoint += '&' + params.toString();
      }

      console.log('🔥 API Call:', `https://insidelab.up.railway.app/api/v1${endpoint}`);
      const response = await ApiService.get(endpoint);
      console.log('✅ Professors response:', response);
      return response.results || response;
    } catch (error) {
      console.error('❌ Error fetching professors:', error);
      return [];
    }
  }

  // Add professor only
  static async addProfessor(professorData) {
    try {
      console.log('🔥 Adding professor with data:', professorData);

      const newProfessorData = {
        name: professorData.professorName,
        university_department: professorData.departmentId,
        university: professorData.universityId
      };

      // Add optional fields
      if (professorData.professorEmail && professorData.professorEmail.trim()) {
        newProfessorData.email = professorData.professorEmail.trim();
      }
      if (professorData.professorWebsite && professorData.professorWebsite.trim()) {
        newProfessorData.personal_website = professorData.professorWebsite.trim();
      }
      if (professorData.profileUrl && professorData.profileUrl.trim()) {
        newProfessorData.profile_url = professorData.profileUrl.trim();
      }
      if (professorData.googleScholarUrl && professorData.googleScholarUrl.trim()) {
        newProfessorData.google_scholar_url = professorData.googleScholarUrl.trim();
      }
      if (professorData.bio && professorData.bio.trim()) {
        newProfessorData.bio = professorData.bio.trim();
      }
      if (professorData.researchInterests && professorData.researchInterests.length > 0) {
        newProfessorData.research_interests = professorData.researchInterests;
      }
      if (professorData.researchGroupId) {
        newProfessorData.research_group = professorData.researchGroupId;
      }

      const professor = await ApiService.post('/professors/', newProfessorData);
      console.log('✅ Professor added successfully:', professor);
      return professor;
    } catch (error) {
      console.error('❌ Error adding professor:', error);
      throw new Error(`Failed to add professor: ${error.message}`);
    }
  }

  // Add lab and professor
  static async addLabAndProfessor(labData) {
    try {
      console.log('🔥 Adding lab and professor with data:', labData);

      // First create the professor using the addProfessor method
      const professor = await this.addProfessor(labData);

      // Then create the lab
      const newLabData = {
        name: labData.labName,
        professor: professor.id,
        university_department: labData.departmentId
      };

      // Add website if provided
      if (labData.labWebsite && labData.labWebsite.trim()) {
        newLabData.website = labData.labWebsite.trim();
      }

      // Add research group if selected
      if (labData.researchGroupId) {
        newLabData.research_group = labData.researchGroupId;
      }

      const lab = await ApiService.post('/labs/', newLabData);
      console.log('✅ Lab added successfully:', lab);

      return {
        ...lab,
        professor_name: professor.name
      };
    } catch (error) {
      console.error('❌ Error adding lab and professor:', error);
      throw new Error(`Failed to add lab and professor: ${error.message}`);
    }
  }

  // Update professor
  static async updateProfessor(professorId, updateData) {
    try {
      console.log('🔥 Updating professor with ID:', professorId, 'Data:', updateData);
      const response = await ApiService.patch(`/professors/${professorId}/`, updateData, true);
      console.log('✅ Professor updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error updating professor:', error);
      throw new Error(`Failed to update professor: ${error.message}`);
    }
  }
}

export { UniversityService };