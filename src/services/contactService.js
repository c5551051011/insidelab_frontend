import { ApiService } from './apiService';

class ContactService {
  /**
   * Send feedback to InsideLab
   * @param {Object} formData - Feedback form data
   * @param {string} formData.email - Contact email address (required)
   * @param {string} formData.name - Name (optional, auto-filled for authenticated users)
   * @param {string} formData.subject - Subject (required)
   * @param {string} formData.message - Message content (required)
   * @returns {Promise<Object>} Response data
   */
  static async sendFeedback(formData) {
    try {
      // Check if user is authenticated
      const isAuthenticated = !!ApiService.getAuthToken();

      // Prepare request payload based on API requirements
      const payload = {
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      };

      // Include name for anonymous users or if explicitly provided
      if (formData.name) {
        payload.name = formData.name;
      }

      const response = await ApiService.post('/auth/feedback/', payload, isAuthenticated);
      return response;
    } catch (error) {
      console.error('Error sending feedback:', error);
      throw error;
    }
  }
}

export default ContactService;
