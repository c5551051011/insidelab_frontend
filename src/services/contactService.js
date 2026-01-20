import { ApiService } from './apiService';

class ContactService {
  /**
   * Send contact form email
   * @param {Object} formData - Contact form data
   * @param {string} formData.type - Type of contact (문의사항 or 기능 추가 요청)
   * @param {string} formData.category - Category of the message
   * @param {string} formData.name - Sender's name
   * @param {string} formData.email - Sender's email
   * @param {string} formData.subject - Message subject
   * @param {string} formData.message - Message content
   * @returns {Promise<Object>} Response data
   */
  static async sendContactEmail(formData) {
    try {
      const response = await ApiService.post('/contact/', formData, false);
      return response;
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw error;
    }
  }
}

export default ContactService;
