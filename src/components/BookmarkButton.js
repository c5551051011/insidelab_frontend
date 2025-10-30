// Reusable BookmarkButton component with multiple save types
import React, { useState, useEffect } from 'react';
import { Bookmark, Send, Eye, UserCheck, ChevronDown, Trash2, Check } from 'lucide-react';
import { BookmarkService, InterestType, InterestConfig } from '../services/bookmarkService';
import { AuthService } from '../services/authService';

const IconMap = {
  Bookmark: Bookmark,
  Send: Send,
  Eye: Eye,
  UserCheck: UserCheck
};

const BookmarkButton = ({
  labId,
  size = 20,
  showDropdown = true,
  className = "",
  onInterestChange = null,
  variant = "default" // "default" or "overlay"
}) => {
  const [currentInterest, setCurrentInterest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(AuthService.isAuthenticated());
    };

    checkAuth();
    loadCurrentInterest();

    // Listen for auth changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [labId]);

  const loadCurrentInterest = async () => {
    if (!AuthService.isAuthenticated()) return;

    try {
      const interest = await BookmarkService.getLabInterest(labId);
      setCurrentInterest(interest);
    } catch (error) {
      console.error('Failed to load current interest:', error);
    }
  };

  const handleSimpleToggle = async () => {
    if (!isAuthenticated || isLoading) return;

    setIsLoading(true);
    try {
      const success = await BookmarkService.toggleSimpleSave(labId);
      if (success) {
        await loadCurrentInterest();
        onInterestChange?.(labId, currentInterest ? null : InterestType.GENERAL);
      } else {
        alert('Failed to update interest. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling simple save:', error);
      alert('Failed to update interest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestTypeSelection = async (interestType) => {
    if (!isAuthenticated || isLoading) return;

    setIsLoading(true);
    setShowMenu(false);

    try {
      const result = await BookmarkService.toggleLabInterest(labId, interestType);
      if (result) {
        await loadCurrentInterest();
        onInterestChange?.(labId, interestType);
      } else {
        alert('Failed to update interest. Please try again.');
      }
    } catch (error) {
      console.error('Error updating interest type:', error);
      alert('Failed to update interest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveInterest = async () => {
    if (!isAuthenticated || isLoading) return;

    setIsLoading(true);
    setShowMenu(false);

    try {
      const success = await BookmarkService.removeLabInterest(labId);
      if (success) {
        setCurrentInterest(null);
        onInterestChange?.(labId, null);
      } else {
        alert('Failed to remove interest. Please try again.');
      }
    } catch (error) {
      console.error('Error removing interest:', error);
      alert('Failed to remove interest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (interestType) => {
    const config = InterestConfig[interestType];
    const IconComponent = IconMap[config?.icon] || Bookmark;
    return IconComponent;
  };

  const getColor = (interestType) => {
    return InterestConfig[interestType]?.color || '#6b7280';
  };

  const getTooltip = () => {
    if (!isAuthenticated) return 'Sign in to save labs';
    if (!currentInterest) return 'Add to interests';
    const config = InterestConfig[currentInterest.interestType];
    return `${config?.label} - Click to change`;
  };

  // Simple bookmark button without dropdown
  if (!showDropdown) {
    const IconComponent = currentInterest ? getIcon(currentInterest.interestType) : Bookmark;
    const iconColor = currentInterest ? getColor(currentInterest.interestType) : '#6b7280';

    return (
      <button
        onClick={handleSimpleToggle}
        disabled={!isAuthenticated || isLoading}
        className={`p-2.5 rounded-xl transition-all duration-200 ${className} ${
          !isAuthenticated || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-black/10 hover:scale-105'
        } ${currentInterest ? 'bg-black/5' : ''}`}
        title={getTooltip()}
        style={{
          backdropFilter: 'blur(10px)',
          border: currentInterest ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        <IconComponent
          size={size}
          style={{ color: iconColor }}
          fill={currentInterest ? 'currentColor' : 'none'}
          className="drop-shadow-sm"
        />
      </button>
    );
  }

  // Enhanced dropdown button
  const currentConfig = currentInterest ? InterestConfig[currentInterest.interestType] : null;
  const CurrentIcon = currentInterest ? getIcon(currentInterest.interestType) : Bookmark;
  const currentColor = currentInterest ? getColor(currentInterest.interestType) : (variant === "overlay" ? 'white' : '#6b7280');

  // Different styles for overlay (lab detail page) vs default (search cards)
  const getButtonStyles = () => {
    if (variant === "overlay") {
      return {
        className: `flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${className} ${
          !isAuthenticated || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-white/20 hover:scale-105'
        } ${currentInterest ? 'bg-white/10 shadow-sm' : ''}`,
        style: {
          backdropFilter: 'blur(10px)',
          border: currentInterest ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
        }
      };
    } else {
      return {
        className: `flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${className} ${
          !isAuthenticated || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-black/10 hover:scale-105'
        } ${currentInterest ? 'bg-black/5 shadow-sm' : ''}`,
        style: {
          backdropFilter: 'blur(10px)',
          border: currentInterest ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
        }
      };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={!isAuthenticated || isLoading}
        className={buttonStyles.className}
        title={getTooltip()}
        style={buttonStyles.style}
      >
        <CurrentIcon
          size={size}
          style={{ color: currentColor }}
          fill={currentInterest ? 'currentColor' : 'none'}
          className="drop-shadow-sm"
        />
        {showDropdown && (
          <ChevronDown size={14} style={{ color: currentColor }} className="drop-shadow-sm" />
        )}
      </button>

      {showMenu && isAuthenticated && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 min-w-[220px]" style={{ backdropFilter: 'blur(20px)' }}>
          {currentInterest && (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CurrentIcon size={14} style={{ color: currentColor }} />
                  <span>Current: {currentConfig?.label}</span>
                </div>
              </div>
            </>
          )}

          {Object.entries(InterestConfig).map(([type, config]) => {
            const IconComponent = IconMap[config.icon];
            const isCurrent = currentInterest?.interestType === type;

            return (
              <button
                key={type}
                onClick={() => handleInterestTypeSelection(type)}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 text-sm transition-colors duration-150 rounded-lg mx-2"
              >
                <IconComponent
                  size={16}
                  style={{ color: isCurrent ? config.color : '#6b7280' }}
                  fill={isCurrent ? 'currentColor' : 'none'}
                />
                <span className={isCurrent ? 'font-medium' : ''} style={{ color: isCurrent ? config.color : '#374151' }}>
                  {config.label}
                </span>
                {isCurrent && (
                  <Check size={14} style={{ color: config.color }} className="ml-auto" />
                )}
              </button>
            );
          })}

          {currentInterest && (
            <>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleRemoveInterest}
                className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600 transition-colors duration-150 rounded-lg mx-2"
              >
                <Trash2 size={16} />
                <span>Remove Interest</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Backdrop to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default BookmarkButton;