import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

const DashboardCard = ({ title, value, icon, color }) => {
  const theme = useTheme();

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div" color="text.secondary">
            {title}
          </Typography>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: '50%', 
              backgroundColor: `${color || theme.palette.primary.main}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(icon, { 
              sx: { 
                color: color || theme.palette.primary.main,
                fontSize: 28
              } 
            })}
          </Box>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DashboardCard; 