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
        { value: 'general', label: '일반 문의' },
        { value: 'technical', label: '기술 문의' },
        { value: 'account', label: '계정 문의' },
        { value: 'other', label: '기타' }
      ]
    : [
        { value: 'feature', label: '새로운 기능' },
        { value: 'improvement', label: '기능 개선' },
        { value: 'bug', label: '버그 제보' },
        { value: 'other', label: '기타' }
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
        type: type === 'inquiry' ? '문의사항' : '기능 추가 요청',
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
          {type === 'inquiry' ? '💬 문의사항' : '💡 기능 추가 요청'}
        </h2>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="category">분류</label>
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
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력해주세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
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
            <label htmlFor="subject">제목</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="제목을 입력해주세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">내용</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="내용을 입력해주세요"
              rows="6"
              required
            />
          </div>

          {submitStatus === 'success' && (
            <div className="submit-message success">
              ✓ 성공적으로 전송되었습니다!
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="submit-message error">
              ✗ 전송 중 오류가 발생했습니다. 다시 시도해주세요.
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '전송 중...' : '전송하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
