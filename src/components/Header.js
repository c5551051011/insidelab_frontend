import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { colors, spacing } from '../theme';

const Header = () => {
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 850;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            fontSize: isMobile ? '18px' : '22px',
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

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing[2],
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.backgroundLight;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <Menu size={24} color={colors.textPrimary} />
          </button>
        )}

        {/* Auth Buttons - Hidden on mobile */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            marginLeft: spacing[4]
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
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              backgroundColor: colors.background,
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: colors.primary,
                fontFamily: 'Inter'
              }}>
                Insidelab
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: spacing[2],
                  borderRadius: '6px',
                }}
              >
                <X size={24} color={colors.textPrimary} />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div style={{
              flex: 1,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[4]
            }}>
              <MobileNavLink
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
              >
                Search
              </MobileNavLink>

              <div style={{ height: '32px' }} />

              <MobileNavLink
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: colors.textPrimary }}
              >
                Sign In
              </MobileNavLink>

              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: `${spacing[4]} ${spacing[6]}`,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: colors.primary,
                  textDecoration: 'none',
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontFamily: 'Inter',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.primary;
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
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

const MobileNavLink = ({ to, children, onClick, style = {} }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        padding: `${spacing[4]} 0`,
        fontSize: '18px',
        fontWeight: '500',
        color: colors.textPrimary,
        textDecoration: 'none',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        fontFamily: 'Inter',
        borderBottom: `1px solid ${colors.border}`,
        ...style
      }}
    >
      {children}
    </Link>
  );
};

export default Header;