/**
 * Validation utilities for form validation
 * These functions match the backend validation rules
 */

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  // Allow only digits, spaces, dashes, parentheses, and plus sign
  // const phoneRegex = /^\+?[0-9]{1,4}?[-.\s]?(\(?\d{1,4}?\))?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    const phoneRegex = /^(?=(?:\D*\d){10})\+?[0-9]{1,4}?[-.\s]?(\(?\d{1,4}?\))?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
  return phoneRegex.test(phone);
};

// Website URL validation
export const validateWebsite = (url: string): boolean => {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return urlRegex.test(url);
};

// Text validation with minimum length
export const validateText = (text: string, minLength: number = 0): boolean => {
  return text.trim().length >= minLength;
};

// Student number validation (varchar(20))
export const validateStudentNumber = (studentNumber: string): boolean => {
  // Check if it's not empty and doesn't exceed 20 characters
  return studentNumber.trim().length > 0 && studentNumber.length <= 20;
};

// Sanitize phone number input
export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d\s\-()+"]/g, '');
};


