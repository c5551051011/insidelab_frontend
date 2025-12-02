import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, School, HelpCircle } from 'lucide-react';
import { colors, spacing, sectionSpacing } from '../theme';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { buildLocalizedPath, getLangFromPath } from '../utils/locale';

const Footer = () => {
  const { width } = useBreakpoint();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const location = useLocation();
  const currentLang = getLangFromPath(location.pathname);
  const localizePath = (path) => buildLocalizedPath(path, currentLang);

  const renderFooterContent = () => {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
          <BrandSection localizePath={localizePath} />
          <ProductLinks localizePath={localizePath} />
          <CompanyLinks localizePath={localizePath} />
          <ResourcesLinks localizePath={localizePath} />
          <SupportLinks localizePath={localizePath} />
        </div>
      );
    } else if (isTablet) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: spacing[10] }}>
            <BrandSection localizePath={localizePath} />
            <ProductLinks localizePath={localizePath} />
            <CompanyLinks localizePath={localizePath} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[10] }}>
            <ResourcesLinks localizePath={localizePath} />
            <SupportLinks localizePath={localizePath} />
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: spacing[10] }}>
          <BrandSection localizePath={localizePath} />
          <ProductLinks localizePath={localizePath} />
          <CompanyLinks localizePath={localizePath} />
          <ResourcesLinks localizePath={localizePath} />
          <SupportLinks localizePath={localizePath} />
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
          <BottomBar isMobile={isMobile} />
        </div>
      </div>
    </footer>
  );
};

const BrandSection = ({ localizePath }) => {
  return (
    <div style={{ maxWidth: '300px' }}>
      {/* Logo */}
      <Link
        to={localizePath('/')}
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
          href={localizePath('/contact')}
          aria-label="Contact us"
        />
        <SocialIcon
          icon={School}
          href={localizePath('/about')}
          aria-label="About us"
        />
        <SocialIcon
          icon={HelpCircle}
          href={localizePath('/faq')}
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

const ProductLinks = ({ localizePath }) => {
  return (
    <FooterSection title="Product">
      <FooterLink to={localizePath('/')}>Professor Reviews</FooterLink>
      <FooterLink to={localizePath('/services/cv-review')}>CV Feedback</FooterLink>
      <FooterLink to={localizePath('/services/mock-interview')}>Mock Interviews</FooterLink>
      <FooterLink to={localizePath('/services')}>Application Services</FooterLink>
    </FooterSection>
  );
};

const CompanyLinks = ({ localizePath }) => {
  return (
    <FooterSection title="Company">
      <FooterLink to={localizePath('/about')}>About Us</FooterLink>
      <FooterLink to={localizePath('/success-stories')}>Success Stories</FooterLink>
      <FooterLink to={localizePath('/careers')}>Careers</FooterLink>
      <FooterLink to={localizePath('/contact')}>Contact</FooterLink>
    </FooterSection>
  );
};

const ResourcesLinks = ({ localizePath }) => {
  return (
    <FooterSection title="Resources">
      <FooterLink to={localizePath('/blog')}>Blog</FooterLink>
      <FooterLink to={localizePath('/guides')}>Guides</FooterLink>
      <FooterLink to={localizePath('/faq')}>FAQ</FooterLink>
      <FooterLink to={localizePath('/help')}>Help Center</FooterLink>
    </FooterSection>
  );
};

const SupportLinks = ({ localizePath }) => {
  return (
    <FooterSection title="Support">
      <FooterLink to={localizePath('/privacy')}>Privacy Policy</FooterLink>
      <FooterLink to={localizePath('/terms')}>Terms of Service</FooterLink>
      <FooterLink to={localizePath('/cookies')}>Cookie Policy</FooterLink>
      <FooterLink to={localizePath('/guidelines')}>Community Guidelines</FooterLink>
    </FooterSection>
  );
};

const BottomBar = ({ isMobile }) => {
  return (
    <div
      style={{
        borderTop: `1px solid ${colors.border || '#E2E8F0'}`,
        paddingTop: spacing[6],
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
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
