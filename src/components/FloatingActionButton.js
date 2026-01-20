import React, { useState } from 'react';
import './FloatingActionButton.css';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: '📋',
      text: '설문조사 참여',
      badge: '스타벅스',
      link: 'https://forms.gle/BuzUtnb9iFBHU9en8',
      description: '추첨을 통해 스타벅스 상품권 증정!'
    },
    {
      icon: '💡',
      text: '기능 추가 요청',
      link: 'mailto:contact@insidelab.com?subject=기능 추가 요청'
    },
    {
      icon: '💬',
      text: '문의사항',
      link: 'mailto:contact@insidelab.com?subject=문의사항'
    }
  ];

  return (
    <>
      {isOpen && <div className="fab-overlay" onClick={closeMenu} />}
      <div className="fab-container">
        <div className={`fab-menu-list ${isOpen ? 'fab-menu-open' : ''}`}>
          {menuItems.map((item, index) => (
            <a
              key={index}
              className="fab-menu-item"
              href={item.link}
              target={item.link.startsWith('http') ? '_blank' : '_self'}
              rel={item.link.startsWith('http') ? 'noopener noreferrer' : ''}
              onClick={closeMenu}
            >
              <span className="fab-menu-icon">{item.icon}</span>
              <span className="fab-menu-text">{item.text}</span>
              {item.badge && <span className="fab-menu-badge">{item.badge}</span>}
            </a>
          ))}
        </div>
        <button className="fab-main-button" onClick={toggleMenu}>
          {isOpen ? '✕' : '💬'}
        </button>
      </div>
    </>
  );
};

export default FloatingActionButton;
