import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors, spacing } from '../theme';

const TermsOfServicePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: `${spacing[8]} ${spacing[4]}`
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            background: 'none',
            border: 'none',
            color: colors.primary,
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: spacing[6],
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Page Header */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          Terms of Service
        </h1>

        <p style={{
          fontSize: '14px',
          color: colors.textSecondary,
          marginBottom: spacing[6],
          fontFamily: 'Inter'
        }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {/* Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: spacing[6],
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${colors.border}`
        }}>
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing and using InsideLab ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              InsideLab provides a platform for users to search for research labs, read and write reviews, and connect with academic research opportunities. The Service may include various features and tools to help users make informed decisions about research labs and academic positions.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              To access certain features of the Service, you may be required to create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your account information</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </Section>

          <Section title="4. User Conduct">
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Post false, misleading, or defamatory reviews</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload malicious code or attempt to disrupt the Service</li>
              <li>Use the Service for any unauthorized commercial purposes</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </Section>

          <Section title="5. Content">
            <p>
              Users are responsible for the content they post on the Service. By submitting content, you grant InsideLab a non-exclusive, worldwide, royalty-free license to use, reproduce, and distribute your content in connection with the Service.
            </p>
            <p>
              We reserve the right to remove any content that violates these Terms or is otherwise objectionable.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              The Service and its original content, features, and functionality are owned by InsideLab and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </Section>

          <Section title="7. Disclaimer of Warranties">
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              InsideLab shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
            </p>
          </Section>

          <Section title="9. Modifications to Service">
            <p>
              We reserve the right to modify or discontinue the Service at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
            </p>
          </Section>

          <Section title="10. Changes to Terms">
            <p>
              We may update these Terms of Service from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date.
            </p>
          </Section>

          <Section title="11. Contact Information">
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p style={{ marginTop: spacing[2] }}>
              <strong>Email:</strong> support@insidelab.com
            </p>
          </Section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const Section = ({ title, children }) => {
  return (
    <div style={{ marginBottom: spacing[6] }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing[3],
        fontFamily: 'Inter'
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: '14px',
        color: colors.textSecondary,
        lineHeight: 1.6,
        fontFamily: 'Inter'
      }}>
        {children}
      </div>
    </div>
  );
};

export default TermsOfServicePage;
