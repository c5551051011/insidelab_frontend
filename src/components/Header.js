import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, FileText } from 'lucide-react';
import { PrimaryButton } from './Button';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';

const Header = () => {
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 850;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
      }
    };

    checkAuth();
    // Listen for auth changes
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setUserMenuOpen(false);
    navigate('/');
    // Dispatch auth change event
    window.dispatchEvent(new Event('authChange'));
  };

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

        {/* Auth Section - Hidden on mobile */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            marginLeft: spacing[4]
          }}>
            {isAuthenticated ? (
              <UserMenu
                user={user}
                isOpen={userMenuOpen}
                onToggle={() => setUserMenuOpen(!userMenuOpen)}
                onLogout={handleLogout}
                userMenuRef={userMenuRef}
              />
            ) : (
              <>
                <Link
                  to="/sign-in"
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
                  Log In
                </Link>
                <PrimaryButton
                  to="/signup"
                  size="small"
                >
                  Sign Up
                </PrimaryButton>
              </>
            )}
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
              width: '320px',
              height: '100%',
              backgroundColor: colors.background,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.background
            }}>
              <span style={{
                fontSize: '20px',
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
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.backgroundLight;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <X size={24} color={colors.textPrimary} />
              </button>
            </div>

            {/* User Info Section (if logged in) */}
            {isAuthenticated && user && (
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: colors.backgroundLight
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3]
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: colors.textPrimary,
                      fontFamily: 'Inter'
                    }}>
                      {user?.email || 'User'}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: colors.textSecondary,
                      fontFamily: 'Inter'
                    }}>
                      Signed in
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Items */}
            <div style={{
              flex: 1,
              padding: '20px 0',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: colors.background
            }}>
              {/* Navigation Links */}
              <MobileMenuItem
                icon={<span style={{ fontSize: '18px' }}>🔍</span>}
                text="Search"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/search';
                }}
              />

              {isAuthenticated ? (
                <>
                  <div style={{
                    height: '1px',
                    backgroundColor: colors.border,
                    margin: '16px 24px'
                  }} />

                  <MobileMenuItem
                    icon={<User size={20} color={colors.textSecondary} />}
                    text="My Profile"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.href = '/profile';
                    }}
                  />

                  <MobileMenuItem
                    icon={<FileText size={20} color={colors.textSecondary} />}
                    text="My Reviews"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.href = '/my-reviews';
                    }}
                  />

                  <div style={{
                    height: '1px',
                    backgroundColor: colors.border,
                    margin: '16px 24px'
                  }} />

                  <MobileMenuItem
                    icon={<LogOut size={20} color={colors.error} />}
                    text="Sign Out"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    style={{ color: colors.error }}
                  />
                </>
              ) : (
                <>
                  <div style={{
                    height: '1px',
                    backgroundColor: colors.border,
                    margin: '16px 24px'
                  }} />

                  <div style={{ padding: '0 24px', marginTop: 'auto' }}>
                    <Link
                      to="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '16px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: colors.textPrimary,
                        textDecoration: 'none',
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`,
                        textAlign: 'center',
                        fontFamily: 'Inter',
                        marginBottom: '12px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = colors.backgroundLight;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      Log In
                    </Link>

                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '16px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        backgroundColor: colors.primary,
                        textAlign: 'center',
                        fontFamily: 'Inter',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = colors.primaryDark || '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = colors.primary;
                      }}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
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

const MobileMenuItem = ({ icon, text, onClick, style = {} }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: spacing[3],
        padding: '16px 24px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        color: colors.textPrimary,
        fontFamily: 'Inter',
        textAlign: 'left',
        transition: 'background-color 0.2s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = colors.backgroundLight;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {icon}
      {text}
    </button>
  );
};

const UserMenu = ({ user, isOpen, onToggle, onLogout, userMenuRef }) => {
  const getUserInitial = () => {
    return user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  };

  const getUserDisplayName = () => {
    return user?.email || 'User';
  };

  return (
    <div style={{ position: 'relative' }} ref={userMenuRef}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          padding: `${spacing[2]} ${spacing[3]}`,
          backgroundColor: 'transparent',
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          cursor: 'pointer',
          fontFamily: 'Inter',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colors.backgroundLight;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {getUserInitial()}
        </div>

        {/* User Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: '80px'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: colors.textPrimary,
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {getUserDisplayName()}
          </span>
        </div>

        <ChevronDown size={16} color={colors.textSecondary} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          minWidth: '200px',
          overflow: 'hidden'
        }}>
          <UserMenuItem
            icon={<User size={16} />}
            text="My Profile"
            onClick={() => window.location.href = '/profile'}
          />
          <UserMenuItem
            icon={<FileText size={16} />}
            text="My Reviews"
            onClick={() => window.location.href = '/my-reviews'}
          />
          <div style={{
            height: '1px',
            backgroundColor: colors.border,
            margin: `${spacing[1]} 0`
          }} />
          <UserMenuItem
            icon={<LogOut size={16} />}
            text="Sign Out"
            onClick={onLogout}
            style={{ color: colors.error }}
          />
        </div>
      )}
    </div>
  );
};

const UserMenuItem = ({ icon, text, onClick, style = {} }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[3]} ${spacing[4]}`,
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: colors.textPrimary,
        fontFamily: 'Inter',
        textAlign: 'left',
        transition: 'background-color 0.2s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = colors.backgroundLight;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {icon}
      {text}
    </button>
  );
};

export default Header;