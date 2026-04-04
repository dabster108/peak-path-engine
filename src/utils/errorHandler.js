// src/utils/errorHandler.js
// Unified error handling utility for consistent error processing across the app

/**
 * Extracts error message from various error response formats
 * @param {Object} error - Error object from axios or similar
 * @param {string} fallback - Fallback message if extraction fails
 * @returns {string} - Extracted error message
 */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  // Handle network errors
  if (!error?.response) {
    return error?.message || "Network error. Please check your connection.";
  }

  const data = error.response.data;

  // Handle different backend response formats
  if (typeof data === "string") {
    return data;
  }

  // Standard Django REST Framework format
  if (data?.detail) {
    return data.detail;
  }

  // Error object with message
  if (data?.error) {
    return data.error;
  }

  // Validation errors (field-specific)
  if (data && typeof data === "object") {
    // Get first error message from validation errors
    const firstError = Object.values(data)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return String(firstError[0]);
    }
    if (typeof firstError === "string") {
      return firstError;
    }
  }

  return fallback;
};

/**
 * Creates a standardized error object for consistent error handling
 * @param {Object} error - Raw error object
 * @param {string} context - Context where error occurred (for logging)
 * @returns {Object} - Standardized error object
 */
export const createErrorObject = (error, context = "") => {
  const message = getErrorMessage(error);
  const statusCode = error?.response?.status;

  return {
    message,
    statusCode,
    context,
    timestamp: new Date().toISOString(),
    originalError: error
  };
};

/**
 * Logs error to console with consistent formatting
 * @param {Object} error - Error object
 * @param {string} context - Context for logging
 */
export const logError = (error, context = "") => {
  const errorObj = createErrorObject(error, context);
  console.error(`[${context}] Error:`, {
    message: errorObj.message,
    statusCode: errorObj.statusCode,
    timestamp: errorObj.timestamp
  });
};

/**
 * Handles API errors with consistent behavior
 * @param {Object} error - Error object
 * @param {Function} showToast - Toast notification function
 * @param {string} context - Context for logging
 * @param {string} fallbackMessage - Fallback message
 */
export const handleApiError = (error, showToast, context = "", fallbackMessage = null) => {
  const message = getErrorMessage(error, fallbackMessage);
  logError(error, context);

  if (showToast) {
    showToast(message, "error");
  }

  return message;
};