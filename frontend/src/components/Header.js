import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const Header = ({ title, userInfo }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      enqueueSnackbar('Déconnexion réussie', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      enqueueSnackbar('Erreur lors de la déconnexion', { variant: 'error' });
    }
  };

  const handleProfile = () => {
    handleClose();
    // Ouvrir le profil
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Bonjour, {userInfo?.nom} {userInfo?.prenom}
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: '#fff', color: '#FE6B8B' }}>
              <AccountIcon />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <MenuItem onClick={handleProfile}>
              <PersonIcon sx={{ mr: 2 }} />
              Mon Profil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 