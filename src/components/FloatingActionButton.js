import React, { useState } from 'react';
import styled from 'styled-components';

const FloatingContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
`;

const MenuList = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 220px;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(10px)'};
  transition: all 0.3s ease;
`;

const MenuItem = styled.a`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #f5f5f5;
  }

  &:not(:last-child) {
    margin-bottom: 4px;
  }
`;

const MenuIcon = styled.span`
  margin-right: 12px;
  font-size: 18px;
`;

const MenuText = styled.span`
  flex: 1;
`;

const MenuBadge = styled.span`
  background: #ff6b6b;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
`;

const MainButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

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
      <Overlay $isOpen={isOpen} onClick={closeMenu} />
      <FloatingContainer>
        <MenuList $isOpen={isOpen}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              href={item.link}
              target={item.link.startsWith('http') ? '_blank' : '_self'}
              rel={item.link.startsWith('http') ? 'noopener noreferrer' : ''}
              onClick={closeMenu}
            >
              <MenuIcon>{item.icon}</MenuIcon>
              <MenuText>{item.text}</MenuText>
              {item.badge && <MenuBadge>{item.badge}</MenuBadge>}
            </MenuItem>
          ))}
        </MenuList>
        <MainButton onClick={toggleMenu}>
          {isOpen ? '✕' : '💬'}
        </MainButton>
      </FloatingContainer>
    </>
  );
};

export default FloatingActionButton;
