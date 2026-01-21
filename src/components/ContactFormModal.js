import React, { useState, useEffect } from 'react';
import './ContactFormModal.css';
import ContactService from '../services/contactService';
import { AuthService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';

const ContactFormModal = ({ isOpen, onClose, type }) => {
  const [formData, setFormData] = useState({
    category: type === 'inquiry' ? 'general' : 'feature',
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toast = useToast();

  // Category options based on type
  const categories = type === 'inquiry'
    ? [
        { value: 'general', label: 'General Inquiry' },
        { value: 'technical', label: 'Technical Support' },
        { value: 'account', label: 'Account Issue' },
        { value: 'other', label: 'Other' }
      ]
    : [
        { value: 'feature', label: 'New Feature' },
        { value: 'improvement', label: 'Improvement' },
        { value: 'bug', label: 'Bug Report' },
        { value: 'other', label: 'Other' }
      ];

  // Load user data on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const userData = AuthService.getUserData();
        if (userData) {
          setFormData(prev => ({
            ...prev,
            name: userData.name || userData.username || '',
            email: userData.email || ''
          }));
        }
      } else {
        // Reset category when modal opens for non-authenticated users
        setFormData(prev => ({
          ...prev,
          category: type === 'inquiry' ? 'general' : 'feature'
        }));
      }
    }
  }, [isOpen, type]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get category label for prefix
      const categoryObj = categories.find(cat => cat.value === formData.category);
      const categoryLabel = categoryObj ? categoryObj.label : '';
      const typeLabel = type === 'feature' ? 'Feature Request' : 'Contact';

      // Add prefix to subject based on type and category
      const subjectPrefix = `[${typeLabel}${categoryLabel ? ' - ' + categoryLabel : ''}] `;
      const submissionData = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: subjectPrefix + formData.subject
      };

      const response = await ContactService.sendFeedback(submissionData);

      if (response.success) {
        toast.success('Feedback sent successfully. Thank you!');
        onClose();
        // Reset form only if not authenticated (authenticated users keep their info)
        if (!isAuthenticated) {
          setFormData({
            category: type === 'inquiry' ? 'general' : 'feature',
            name: '',
            email: '',
            subject: '',
            message: ''
          });
        } else {
          setFormData(prev => ({
            ...prev,
            category: type === 'inquiry' ? 'general' : 'feature',
            subject: '',
            message: ''
          }));
        }
      } else {
        toast.error(response.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);

      // Extract error message from API response if available
      let errorMessage = 'Failed to send feedback. Please try again.';
      if (error.statusCode === 400 && error.message) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Keep default error message
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="contact-modal-close" onClick={onClose}>✕</button>

        <h2 className="contact-modal-title">
          {type === 'inquiry' ? '💬 Contact Us' : '💡 Feature Request'}
        </h2>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Name {!isAuthenticated && '*'}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required={!isAuthenticated}
              disabled={isAuthenticated}
              className={isAuthenticated ? 'disabled-input' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
              disabled={isAuthenticated}
              className={isAuthenticated ? 'disabled-input' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter subject"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter your message"
              rows="6"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
