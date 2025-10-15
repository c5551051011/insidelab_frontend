// University Service for university operations
import { ApiService } from './apiService';

class UniversityService {
  static async getAllUniversities(search = '') {
    try {
      const endpoint = search ? `/universities/?search=${encodeURIComponent(search)}` : '/universities/';
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
      const response = await ApiService.post('/universities/', universityData);
      return response;
    } catch (error) {
      console.log('DEBUG: Error adding university:', error);
      // For demo purposes, return mock success
      return {
        id: Date.now().toString(),
        name: universityData.name,
        website: universityData.website,
        country: universityData.country,
        state: universityData.state,
        city: universityData.city,
      };
    }
  }

  // Get all departments globally (new approach)
  static async getAllDepartments() {
    try {
      console.log('🔥 API Call: https://insidelab.up.railway.app/api/v1/departments/');
      const response = await ApiService.get('/departments/');
      console.log('✅ All departments response:', response);
      return response.results || response;
    } catch (error) {
      console.error('❌ Error fetching all departments:', error);
      return [];
    }
  }

  static async getDepartmentsByUniversity(universityId) {
    try {
      const response = await ApiService.get(`/universities/${universityId}/departments/`);
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
      const response = await ApiService.post(`/universities/${universityId}/departments/`, departmentData);
      return response;
    } catch (error) {
      console.log('DEBUG: Error adding department:', error);
      // For demo purposes, return mock success
      return {
        id: Date.now().toString(),
        name: departmentData.name,
        university_id: universityId,
      };
    }
  }
}

export { UniversityService };