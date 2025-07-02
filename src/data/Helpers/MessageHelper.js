import React from 'react';
import { toast, ToastContainer } from 'react-toastify';

/**
 * Renders the ToastContainer component.
 * This component should be placed once at the root of your application
 * to display all toast notifications.
 *
 * @returns {JSX.Element} The ToastContainer component.
 */
export const MessageToastContainer = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastStyle={{
        minWidth: '500px',
        minHeight: '100px',
        fontSize: '1.2rem',
      }}
    />
  );
};

/**
 * Displays a success toast notification.
 * @param {string} message - The message to display.
 * @param {object} [options] - Optional configuration for the toast.
 */
export const showSuccessToast = (message, options) => {
  toast.success(message, {
    autoClose: 5000,
    ...options
  });
};

/**
 * Displays an error toast notification.
 * @param {string} message - The message to display.
 * @param {object} [options] - Optional configuration for the toast.
 */
export const showErrorToast = (message, options) => {
  toast.error(message, {
    autoClose: false, // Errors typically stay until dismissed
    ...options
  });
};

/**
 * Displays an informational toast notification.
 * @param {string} message - The message to display.
 * @param {object} [options] - Optional configuration for the toast.
 */
export const showInfoToast = (message, options) => {
  toast.info(message, {
    autoClose: 5000,
    ...options
  });
};

/**
 * Displays a warning toast notification.
 * @param {string} message - The message to display.
 * @param {object} [options] - Optional configuration for the toast.
 */
export const showWarningToast = (message, options) => {
  toast.warn(message, {
    autoClose: 7000, // Warnings stay a bit longer
    ...options
  });
};

/**
 * Displays a confirmation dialog as a toast notification.
 * @param {string} message - The confirmation message to display.
 * @param {function} onConfirm - Callback function when user confirms.
 * @param {function} onCancel - Callback function when user cancels.
 * @param {object} [options] - Optional configuration for the toast.
 */

export const showConfirmationToast = (message, { onConfirm }) => {
  toast.info(
    ({ closeToast }) => (
      <div>
        <p>{message}</p>
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => {
              onConfirm();
              closeToast();
            }}
          >
            Confirm
          </button>
          <button onClick={closeToast} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
    }
  );
};
