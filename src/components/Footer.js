import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
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
          <div style={{ display: 'flex', gap: spacing[10] }}>
            <div style={{ flex: 2 }}>
              <BrandSection />
            </div>
            <div style={{ flex: 1 }}>
              <ProductLinks />
            </div>
            <div style={{ flex: 1 }}>
              <CompanyLinks />
            </div>
          </div>
          <div style={{ display: 'flex', gap: spacing[10] }}>
            <div style={{ flex: 1 }}>
              <ResourcesLinks />
            </div>
            <div style={{ flex: 1 }}>
              <SupportLinks />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', gap: spacing[16] }}>
          <div style={{ flex: 2 }}>
            <BrandSection />
          </div>
          <div style={{ flex: 1 }}>
            <ProductLinks />
          </div>
          <div style={{ flex: 1 }}>
            <CompanyLinks />
          </div>
          <div style={{ flex: 1 }}>
            <ResourcesLinks />
          </div>
          <div style={{ flex: 1 }}>
            <SupportLinks />
          </div>
        </div>
      );
    }
  };

  return (
    <footer
      style={{
        backgroundColor: colors.surface,
        padding: `${isMobile ? spacing[12] : spacing[16]} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
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
    <div>
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          textDecoration: 'none',
          marginBottom: spacing[4],
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '18px',
          }}
        >
          IL
        </div>
        <span
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: colors.textPrimary,
            fontFamily: 'Inter',
          }}
        >
          InsideLab
        </span>
      </Link>

      {/* Description */}
      <p
        style={{
          fontSize: '16px',
          color: colors.textSecondary,
          lineHeight: 1.6,
          marginBottom: spacing[6],
          maxWidth: '300px',
        }}
      >
        Your trusted platform for navigating graduate school applications with expert guidance
        and real student insights.
      </p>

      {/* Contact Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <Mail size={16} color={colors.textTertiary} />
          <a
            href="mailto:hello@insidelab.com"
            style={{
              fontSize: '14px',
              color: colors.textSecondary,
              textDecoration: 'none',
            }}
          >
            hello@insidelab.com
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <Phone size={16} color={colors.textTertiary} />
          <span
            style={{
              fontSize: '14px',
              color: colors.textSecondary,
            }}
          >
            +1 (555) 123-4567
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <MapPin size={16} color={colors.textTertiary} />
          <span
            style={{
              fontSize: '14px',
              color: colors.textSecondary,
            }}
          >
            San Francisco, CA
          </span>
        </div>
      </div>
    </div>
  );
};

const FooterSection = ({ title, children }) => {
  return (
    <div>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: '600',
          color: colors.textPrimary,
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
    color: colors.textSecondary,
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  };

  const handleMouseEnter = (e) => {
    e.target.style.color = colors.primary;
  };

  const handleMouseLeave = (e) => {
    e.target.style.color = colors.textSecondary;
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
      <FooterLink to="/search">Lab Reviews</FooterLink>
      <FooterLink to="/services/cv-review">CV Feedback</FooterLink>
      <FooterLink to="/services/mock-interview">Mock Interviews</FooterLink>
      <FooterLink to="/pricing">Pricing</FooterLink>
      <FooterLink to="/features">Features</FooterLink>
    </FooterSection>
  );
};

const CompanyLinks = () => {
  return (
    <FooterSection title="Company">
      <FooterLink to="/about">About Us</FooterLink>
      <FooterLink to="/careers">Careers</FooterLink>
      <FooterLink to="/blog">Blog</FooterLink>
      <FooterLink to="/press">Press</FooterLink>
      <FooterLink to="/investors">Investors</FooterLink>
    </FooterSection>
  );
};

const ResourcesLinks = () => {
  return (
    <FooterSection title="Resources">
      <FooterLink to="/guides">Application Guides</FooterLink>
      <FooterLink to="/university-profiles">University Profiles</FooterLink>
      <FooterLink to="/success-stories">Success Stories</FooterLink>
      <FooterLink to="/webinars">Webinars</FooterLink>
      <FooterLink to="/newsletter">Newsletter</FooterLink>
    </FooterSection>
  );
};

const SupportLinks = () => {
  return (
    <FooterSection title="Support">
      <FooterLink to="/help">Help Center</FooterLink>
      <FooterLink to="/contact">Contact Us</FooterLink>
      <FooterLink to="/community">Community</FooterLink>
      <FooterLink to="/api">API Documentation</FooterLink>
      <FooterLink to="/status" external>Status Page</FooterLink>
    </FooterSection>
  );
};

const BottomBar = () => {
  return (
    <div
      style={{
        borderTop: `1px solid ${colors.border}`,
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
          color: colors.textTertiary,
        }}
      >
        © 2024 InsideLab. All rights reserved.
      </div>

      <div
        style={{
          display: 'flex',
          gap: spacing[6],
          flexWrap: 'wrap',
        }}
      >
        <FooterLink to="/privacy">Privacy Policy</FooterLink>
        <FooterLink to="/terms">Terms of Service</FooterLink>
        <FooterLink to="/cookies">Cookie Policy</FooterLink>
        <FooterLink to="/sitemap">Sitemap</FooterLink>
      </div>
    </div>
  );
};

export default Footer;