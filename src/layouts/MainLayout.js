import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const drawerWidth = 240;
const collapsedDrawerWidth = 65;

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const currentDrawerWidth = open ? drawerWidth : collapsedDrawerWidth;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <Header open={open} toggleDrawer={toggleDrawer} />
      <Sidebar open={open} drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Empty toolbar to push content below app bar */}
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 