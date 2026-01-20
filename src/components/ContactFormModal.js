import React, { useState } from 'react';
import './ContactFormModal.css';
import ContactService from '../services/contactService';

const ContactFormModal = ({ isOpen, onClose, type }) => {
  const [formData, setFormData] = useState({
    category: type === 'inquiry' ? 'general' : 'feature',
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await ContactService.sendContactEmail({
        ...formData,
        type: type === 'inquiry' ? 'Contact Us' : 'Feature Request',
        recipient: 'insidelab25@gmail.com'
      });

      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        setFormData({
          category: type === 'inquiry' ? 'general' : 'feature',
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
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
            <label htmlFor="category">Category</label>
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
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
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
            <label htmlFor="message">Message</label>
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

          {submitStatus === 'success' && (
            <div className="submit-message success">
              ✓ Successfully sent!
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="submit-message error">
              ✗ An error occurred. Please try again.
            </div>
          )}

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
