import React, { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Button,
  useMediaQuery,
  Menu,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { AuthContext } from '../App';

const Header = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { setIsAuthenticated, setUser } = useContext(AuthContext);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    
    // Properly logout: clear localStorage and update context
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    
    // Navigate to login page
    navigate('/login');
  };

  // Get current user from localStorage
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : { name: 'Admin' };
  const userInitial = currentUser?.name?.charAt(0) || 'A';

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        {!isMobile && (
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sports Academy Admin
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            color="inherit" 
            onClick={handleProfileMenuOpen}
            startIcon={
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: theme.palette.secondary.main 
                }}
              >
                {userInitial}
              </Avatar>
            }
          >
            {!isMobile && (currentUser?.name || 'Admin User')}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 