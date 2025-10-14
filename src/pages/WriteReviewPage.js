import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { colors, spacing } from '../theme';
import ReviewForm from '../components/review/ReviewForm';
import { ReviewService } from '../services/reviewService';
import { AuthService } from '../services/authService';

const WriteReviewPage = () => {
  const navigate = useNavigate();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Check if user is authenticated
  const isAuthenticated = AuthService.isAuthenticated();

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmitError(null);

      // Submit the review
      const submittedReview = await ReviewService.submitReview(reviewData);

      setSubmitSuccess(true);

      // Redirect to success or back to home after a delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

      return submittedReview;
    } catch (error) {
      setSubmitError(error.message);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4]
      }}>
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: spacing[8],
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <AlertCircle size={48} color={colors.warning} style={{ marginBottom: spacing[4] }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[4],
            fontFamily: 'Inter'
          }}>
            Authentication Required
          </h2>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            marginBottom: spacing[6],
            fontFamily: 'Inter',
            lineHeight: '1.5'
          }}>
            You need to be logged in to write a review. Please sign in to continue.
          </p>
          <div style={{
            display: 'flex',
            gap: spacing[3],
            justifyContent: 'center'
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Inter',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
            <button
              onClick={() => navigate('/sign-in')}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: colors.primary,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show success message
  if (submitSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4]
      }}>
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: spacing[8],
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <CheckCircle size={48} color={colors.success} style={{ marginBottom: spacing[4] }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[4],
            fontFamily: 'Inter'
          }}>
            Review Submitted!
          </h2>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            marginBottom: spacing[6],
            fontFamily: 'Inter',
            lineHeight: '1.5'
          }}>
            Thank you for sharing your experience. Your review will help others make informed decisions about their research opportunities.
          </p>
          <p style={{
            fontSize: '14px',
            color: colors.textTertiary,
            fontFamily: 'Inter'
          }}>
            Redirecting you back to the home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding: spacing[4]
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[4]
        }}>
          <button
            onClick={handleCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[3]}`,
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Inter',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: colors.textPrimary,
              margin: 0,
              fontFamily: 'Inter'
            }}>
              Write a Review
            </h1>
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: 0,
              marginTop: spacing[1],
              fontFamily: 'Inter'
            }}>
              Share your research experience to help others
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: spacing[6]
      }}>
        {/* Error Message */}
        {submitError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: spacing[4],
            backgroundColor: colors.error + '10',
            border: `1px solid ${colors.error}`,
            borderRadius: '8px',
            marginBottom: spacing[6]
          }}>
            <AlertCircle size={20} color={colors.error} />
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.error,
                margin: 0,
                fontFamily: 'Inter'
              }}>
                Failed to Submit Review
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.error,
                margin: 0,
                marginTop: spacing[1],
                fontFamily: 'Inter'
              }}>
                {submitError}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: spacing[6],
          marginBottom: spacing[6],
          border: `1px solid ${colors.border}`
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: 0,
            marginBottom: spacing[3],
            fontFamily: 'Inter'
          }}>
            Review Guidelines
          </h2>
          <ul style={{
            fontSize: '14px',
            color: colors.textSecondary,
            fontFamily: 'Inter',
            lineHeight: '1.6',
            margin: 0,
            paddingLeft: spacing[4]
          }}>
            <li style={{ marginBottom: spacing[2] }}>
              Be honest and constructive in your feedback
            </li>
            <li style={{ marginBottom: spacing[2] }}>
              Focus on your personal experience and specific details
            </li>
            <li style={{ marginBottom: spacing[2] }}>
              Respect privacy - avoid sharing sensitive information
            </li>
            <li style={{ marginBottom: spacing[2] }}>
              Your review will be anonymous to protect your privacy
            </li>
            <li>
              Provide ratings across different categories to help others understand the full picture
            </li>
          </ul>
        </div>

        {/* Review Form */}
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: spacing[6],
          border: `1px solid ${colors.border}`
        }}>
          <ReviewForm
            onSubmit={handleSubmitReview}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default WriteReviewPage;