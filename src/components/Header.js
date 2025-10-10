import React from 'react';
import { Link } from 'react-router-dom';
import { Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <nav className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
          color: '#1f2937'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '18px'
          }}>
            IL
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            InsideLab
          </span>
        </Link>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          maxWidth: '400px',
          width: '100%',
          margin: '0 32px'
        }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }}
          />
          <input
            type="text"
            placeholder="Search labs, professors, universities..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Link
            to="/login"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <User size={16} />
            Sign In
          </Link>
          <Link
            to="/signup"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;