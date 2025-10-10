import React from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '../theme';

const Header = () => {
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 850;

  return (
    <header style={{
      height: '72px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        height: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo - Flutter와 동일한 스타일 */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
          }}
        >
          <span style={{
            fontSize: '22px',
            fontWeight: '700',
            color: colors.primary,
            fontFamily: 'Inter'
          }}>
            Insidelab
          </span>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3]
          }}>
            <NavLink to="/search">Search</NavLink>
          </div>
        )}

        {/* Auth Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          marginLeft: isMobile ? 0 : spacing[4]
        }}>
          <Link
            to="/login"
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              textDecoration: 'none',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.backgroundLight;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: colors.primary,
              textDecoration: 'none',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.primaryHover;
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.primary;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      style={{
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: '14px',
        fontWeight: '500',
        color: colors.textSecondary,
        textDecoration: 'none',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        fontFamily: 'Inter'
      }}
      onMouseEnter={(e) => {
        e.target.style.color = colors.primary;
        e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.color = colors.textSecondary;
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </Link>
  );
};

export default Header;