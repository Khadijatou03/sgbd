import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarContext = createContext(null);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const showSnackbar = (message, severity = 'info') => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const value = {
    showSnackbar,
    showSuccess: (message) => showSnackbar(message, 'success'),
    showError: (message) => showSnackbar(message, 'error'),
    showWarning: (message) => showSnackbar(message, 'warning'),
    showInfo: (message) => showSnackbar(message, 'info')
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export default SnackbarContext; 