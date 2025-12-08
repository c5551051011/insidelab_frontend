import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors, spacing } from '../theme';

const PrivacyPolicyPage = () => {
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
          Privacy Policy
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
          <Section title="1. Introduction">
            <p>
              InsideLab ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h3>2.1 Personal Information</h3>
            <p>
              When you create an account, we may collect:
            </p>
            <ul>
              <li>Name and email address</li>
              <li>Username and password</li>
              <li>Academic affiliation and research interests</li>
              <li>Profile information you choose to provide</li>
            </ul>

            <h3>2.2 Usage Information</h3>
            <p>
              We automatically collect certain information about your use of the Service:
            </p>
            <ul>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Pages visited and features used</li>
              <li>Search queries and interactions</li>
            </ul>

            <h3>2.3 Cookies and Tracking Technologies</h3>
            <p>
              We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>
              We use the collected information for:
            </p>
            <ul>
              <li>Providing and maintaining the Service</li>
              <li>Personalizing your experience</li>
              <li>Communicating with you about updates and features</li>
              <li>Analyzing and improving the Service</li>
              <li>Detecting and preventing fraud or abuse</li>
              <li>Complying with legal obligations</li>
            </ul>
          </Section>

          <Section title="4. Information Sharing and Disclosure">
            <p>
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul>
              <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
              <li><strong>Service providers:</strong> With third-party vendors who help us operate the Service</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </Section>

          <Section title="5. Data Security">
            <p>
              We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="6. Your Privacy Rights">
            <p>
              Depending on your location, you may have the following rights:
            </p>
            <ul>
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-out:</strong> Opt-out of marketing communications</li>
              <li><strong>Data portability:</strong> Request a copy of your data in a portable format</li>
            </ul>
            <p>
              To exercise these rights, please contact us at privacy@insidelab.com
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information, except where required by law.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          </Section>

          <Section title="9. International Data Transfers">
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </Section>

          <Section title="10. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us:
            </p>
            <p style={{ marginTop: spacing[2] }}>
              <strong>Email:</strong> privacy@insidelab.com<br />
              <strong>Support:</strong> support@insidelab.com
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

export default PrivacyPolicyPage;
