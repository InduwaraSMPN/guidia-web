/**
 * Image utility functions for handling Azure Blob Storage URLs
 */

import { getFullAzureUrl } from './azureUtils';

/**
 * User types supported in the application
 */
export type UserType = 'student' | 'counselor' | 'company';

/**
 * Get the full URL for an image, handling both full URLs and relative paths
 *
 * @param imagePath The image path or URL
 * @param fallbackImage Optional fallback image URL if the provided path is empty
 * @returns The full image URL
 */
export const getImageUrl = (imagePath?: string, fallbackImage: string = '/default-avatar.png'): string => {
  if (!imagePath) {
    return fallbackImage;
  }

  return getFullAzureUrl(imagePath);
};

/**
 * Get the appropriate fallback image based on user type
 *
 * @param userType The type of user
 * @returns The fallback image URL
 */
export const getFallbackImageByUserType = (userType?: UserType): string => {
  switch (userType) {
    case 'student':
      return '/student-avatar.png';
    case 'counselor':
      return '/counselor-avatar.png';
    case 'company':
      return '/company-logo.png';

    default:
      return '/default-avatar.png';
  }
};

/**
 * Get the profile image URL for a specific user type
 *
 * @param profileData The profile data object containing image paths
 * @param userType The type of user
 * @returns The full image URL or fallback image
 */
export const getProfileImageUrl = (profileData: any, userType?: UserType): string => {
  if (!profileData) {
    return getFallbackImageByUserType(userType);
  }

  let imagePath;

  switch (userType) {
    case 'student':
      imagePath = profileData.studentProfileImagePath;
      break;
    case 'counselor':
      imagePath = profileData.counselorProfileImagePath;
      break;
    case 'company':
      imagePath = profileData.companyLogoPath;
      break;
    default:
      // Try to find any image path in the profile data
      imagePath = profileData.studentProfileImagePath ||
                 profileData.counselorProfileImagePath ||
                 profileData.companyLogoPath;
  }

  return getImageUrl(imagePath, getFallbackImageByUserType(userType));
};

/**
 * Image component that handles Azure Blob Storage paths
 */
import React from 'react';

interface AzureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  userType?: UserType;
  profileData?: any;
  rounded?: boolean;
}

export const AzureImage: React.FC<AzureImageProps> = ({
  src,
  fallbackSrc,
  userType,
  profileData,
  alt = 'Image',
  rounded = false,
  className = '',
  ...props
}) => {
  // Determine the fallback image based on user type if provided
  const defaultFallback = userType ? getFallbackImageByUserType(userType) : '/default-avatar.png';
  const rawFallbackSrc = fallbackSrc || defaultFallback;

  // Ensure fallback src has the correct base URL
  const actualFallbackSrc = rawFallbackSrc.startsWith('/')
    ? `${window.location.origin}${rawFallbackSrc}`
    : rawFallbackSrc;

  // Log the input parameters for debugging
  console.log('AzureImage component - Input parameters:', {
    src,
    userType,
    hasProfileData: !!profileData,
    rawFallbackSrc,
    actualFallbackSrc
  });

  // If profileData is provided, use it to get the image URL
  let fullSrc;
  if (profileData && userType) {
    fullSrc = getProfileImageUrl(profileData, userType);
    console.log('AzureImage - Using profile data to get URL:', { userType, fullSrc });
  } else if (src && src.startsWith('blob:')) {
    // If it's a blob URL, use it directly
    fullSrc = src;
    console.log('AzureImage - Using blob URL directly:', { src });
  } else {
    fullSrc = src ? getFullAzureUrl(src) : actualFallbackSrc;
    console.log('AzureImage - Using direct src with Azure URL conversion:', { src, fullSrc });
  }

  // Add rounded class if needed
  const imageClassName = `${className} ${rounded ? '' : ''}`;

  return (
    <img
      src={fullSrc}
      alt={alt}
      className={imageClassName}
      onError={(e) => {
        // Log the error for debugging
        console.error('AzureImage - Image load error:', {
          failedSrc: e.currentTarget.src,
          fallbackSrc: actualFallbackSrc,
          originalSrc: src
        });

        // Fallback to default image if the image fails to load
        if (e.currentTarget.src !== actualFallbackSrc) {
          console.log('AzureImage - Setting fallback image:', actualFallbackSrc);
          e.currentTarget.src = actualFallbackSrc;
        }
      }}
      {...props}
    />
  );
};

/**
 * Specialized image components for different user types
 */

export const StudentImage: React.FC<Omit<AzureImageProps, 'userType'>> = (props) => {
  return <AzureImage userType="student" rounded {...props} />;
};

export const CounselorImage: React.FC<Omit<AzureImageProps, 'userType'>> = (props) => {
  console.log('CounselorImage component - Props:', props);
  return <AzureImage userType="counselor" rounded {...props} />;
};

export const CompanyImage: React.FC<Omit<AzureImageProps, 'userType'>> = (props) => {
  return <AzureImage userType="company" {...props} />;
};


