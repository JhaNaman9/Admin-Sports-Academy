import React from 'react';
import {
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  People as PeopleIcon,
  Payment as PaymentIcon,
  EmojiEvents as TournamentIcon,
  SportsSoccer as CoachesIcon,
  Announcement as AnnouncementIcon,
  Settings as SettingsIcon,
  RestaurantMenu as DietIcon,
  DirectionsRun as ActivityIcon,
  NotificationsActive as NotificationsIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Students', icon: <PeopleIcon />, path: '/students' },
  { text: 'Sport Categories', icon: <CategoryIcon />, path: '/sport-categories' },
  { text: 'Coaches', icon: <CoachesIcon />, path: '/coaches' },
  { text: 'Diet Plans', icon: <DietIcon />, path: '/diet-plans' },
  { text: 'Activities', icon: <ActivityIcon />, path: '/activities' },
  { text: 'Tournaments', icon: <TournamentIcon />, path: '/tournaments' },
  { text: 'Subscriptions', icon: <PaymentIcon />, path: '/subscriptions' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
  { text: 'Announcements', icon: <AnnouncementIcon />, path: '/announcements' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open, drawerWidth }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          whiteSpace: 'nowrap',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          width: open ? drawerWidth : 0,
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              key={item.text} 
              disablePadding
              sx={{ display: 'block' }}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  bgcolor: location.pathname === item.path ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(2, 136, 209, 0.1)',
                  }
                }}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                    '& .MuiTypography-root': {
                      fontWeight: location.pathname === item.path ? 600 : 400
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 