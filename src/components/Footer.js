import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, School, HelpCircle } from 'lucide-react';
import { colors, spacing, sectionSpacing } from '../theme';

const Footer = () => {
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  const renderFooterContent = () => {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
          <BrandSection />
          <ProductLinks />
          <CompanyLinks />
          <ResourcesLinks />
          <SupportLinks />
        </div>
      );
    } else if (isTablet) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: spacing[10] }}>
            <BrandSection />
            <ProductLinks />
            <CompanyLinks />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[10] }}>
            <ResourcesLinks />
            <SupportLinks />
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: spacing[10] }}>
          <BrandSection />
          <ProductLinks />
          <CompanyLinks />
          <ResourcesLinks />
          <SupportLinks />
        </div>
      );
    }
  };

  return (
    <footer
      style={{
        backgroundColor: colors.surface || '#FFFFFF',
        borderTop: `1px solid ${colors.border || '#E2E8F0'}`,
        padding: `${isMobile ? '48px' : '64px'} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {renderFooterContent()}

        <div style={{ marginTop: spacing[8] }}>
          <BottomBar />
        </div>
      </div>
    </footer>
  );
};

const BrandSection = () => {
  return (
    <div style={{ maxWidth: '300px' }}>
      {/* Logo */}
      <Link
        to="/"
        style={{
          textDecoration: 'none',
          marginBottom: spacing[4],
          display: 'block',
        }}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: colors.primary || '#2563EB',
            fontFamily: 'Inter',
          }}
        >
          Insidelab
        </span>
      </Link>

      {/* Description */}
      <p
        style={{
          fontSize: '14px',
          color: colors.textSecondary || '#6B7280',
          lineHeight: 1.5,
          marginBottom: spacing[6],
          margin: 0,
          marginBottom: spacing[6],
        }}
      >
        Your trusted partner for graduate school success. Get insider reviews, professional feedback, and expert guidance from students who made it.
      </p>

      {/* Social Icons */}
      <div style={{ display: 'flex', gap: spacing[3] }}>
        <SocialIcon
          icon={Mail}
          href="/contact"
          aria-label="Contact us"
        />
        <SocialIcon
          icon={School}
          href="/about"
          aria-label="About us"
        />
        <SocialIcon
          icon={HelpCircle}
          href="/faq"
          aria-label="FAQ"
        />
      </div>
    </div>
  );
};

const SocialIcon = ({ icon: Icon, href, 'aria-label': ariaLabel }) => {
  return (
    <Link
      to={href}
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: colors.backgroundSecondary || '#F9FAFB',
        color: colors.textSecondary || '#6B7280',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = colors.primary || '#2563EB';
        e.target.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = colors.backgroundSecondary || '#F9FAFB';
        e.target.style.color = colors.textSecondary || '#6B7280';
      }}
    >
      <Icon size={18} />
    </Link>
  );
};

const FooterSection = ({ title, children }) => {
  return (
    <div>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: '600',
          color: colors.textPrimary || '#1F2937',
          marginBottom: spacing[4],
          fontFamily: 'Inter',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
        {children}
      </div>
    </div>
  );
};

const FooterLink = ({ to, children, external = false }) => {
  const linkStyle = {
    fontSize: '14px',
    color: colors.textSecondary || '#6B7280',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    display: 'block',
    padding: `${spacing[1]} 0`,
  };

  const handleMouseEnter = (e) => {
    e.target.style.color = colors.primary || '#2563EB';
  };

  const handleMouseLeave = (e) => {
    e.target.style.color = colors.textSecondary || '#6B7280';
  };

  if (external) {
    return (
      <a
        href={to}
        style={linkStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={to}
      style={linkStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
};

const ProductLinks = () => {
  return (
    <FooterSection title="Product">
      <FooterLink to="/">Professor Reviews</FooterLink>
      <FooterLink to="/services/cv-review">CV Feedback</FooterLink>
      <FooterLink to="/services/mock-interview">Mock Interviews</FooterLink>
      <FooterLink to="/services">Application Services</FooterLink>
    </FooterSection>
  );
};

const CompanyLinks = () => {
  return (
    <FooterSection title="Company">
      <FooterLink to="/about">About Us</FooterLink>
      <FooterLink to="/success-stories">Success Stories</FooterLink>
      <FooterLink to="/careers">Careers</FooterLink>
      <FooterLink to="/contact">Contact</FooterLink>
    </FooterSection>
  );
};

const ResourcesLinks = () => {
  return (
    <FooterSection title="Resources">
      <FooterLink to="/blog">Blog</FooterLink>
      <FooterLink to="/guides">Guides</FooterLink>
      <FooterLink to="/faq">FAQ</FooterLink>
      <FooterLink to="/help">Help Center</FooterLink>
    </FooterSection>
  );
};

const SupportLinks = () => {
  return (
    <FooterSection title="Support">
      <FooterLink to="/privacy">Privacy Policy</FooterLink>
      <FooterLink to="/terms">Terms of Service</FooterLink>
      <FooterLink to="/cookies">Cookie Policy</FooterLink>
      <FooterLink to="/guidelines">Community Guidelines</FooterLink>
    </FooterSection>
  );
};

const BottomBar = () => {
  return (
    <div
      style={{
        borderTop: `1px solid ${colors.border || '#E2E8F0'}`,
        paddingTop: spacing[6],
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
        gap: spacing[4],
      }}
    >
      <div
        style={{
          fontSize: '14px',
          color: colors.textTertiary || '#9CA3AF',
        }}
      >
        © 2024 Insidelab. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;