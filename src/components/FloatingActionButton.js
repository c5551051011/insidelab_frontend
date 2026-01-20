import React, { useState } from 'react';
import './FloatingActionButton.css';
import ContactFormModal from './ContactFormModal';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const openModal = (type) => {
    setModalType(type);
    closeMenu();
  };

  const closeModal = () => {
    setModalType(null);
  };

  const menuItems = [
    {
      icon: '📋',
      text: 'Take Survey',
      badge: 'Starbucks',
      type: 'link',
      link: 'https://forms.gle/BuzUtnb9iFBHU9en8'
    },
    {
      icon: '💡',
      text: 'Feature Request',
      type: 'modal',
      modalType: 'feature'
    },
    {
      icon: '💬',
      text: 'Contact Us',
      type: 'modal',
      modalType: 'inquiry'
    }
  ];

  const handleItemClick = (item, e) => {
    if (item.type === 'modal') {
      e.preventDefault();
      openModal(item.modalType);
    } else {
      closeMenu();
    }
  };

  return (
    <>
      {isOpen && <div className="fab-overlay" onClick={closeMenu} />}
      <div className="fab-container">
        <div className={`fab-menu-list ${isOpen ? 'fab-menu-open' : ''}`}>
          {menuItems.map((item, index) => (
            item.type === 'link' ? (
              <a
                key={index}
                className="fab-menu-item"
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => closeMenu()}
              >
                <span className="fab-menu-icon">{item.icon}</span>
                <span className="fab-menu-text">{item.text}</span>
                {item.badge && <span className="fab-menu-badge">{item.badge}</span>}
              </a>
            ) : (
              <div
                key={index}
                className="fab-menu-item"
                onClick={(e) => handleItemClick(item, e)}
              >
                <span className="fab-menu-icon">{item.icon}</span>
                <span className="fab-menu-text">{item.text}</span>
                {item.badge && <span className="fab-menu-badge">{item.badge}</span>}
              </div>
            )
          ))}
        </div>
        <button className="fab-main-button" onClick={toggleMenu}>
          {isOpen ? '✕' : '💬'}
        </button>
      </div>

      <ContactFormModal
        isOpen={modalType === 'inquiry'}
        onClose={closeModal}
        type="inquiry"
      />

      <ContactFormModal
        isOpen={modalType === 'feature'}
        onClose={closeModal}
        type="feature"
      />
    </>
  );
};

export default FloatingActionButton;
