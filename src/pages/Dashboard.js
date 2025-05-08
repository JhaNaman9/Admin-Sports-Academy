import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import DashboardCard from '../components/DashboardCard';
import { 
  People as PeopleIcon,
  Payment as PaymentIcon,
  EmojiEvents as TournamentIcon,
  SportsSoccer as CoachesIcon 
} from '@mui/icons-material';

const Dashboard = () => {
  // Static dashboard data
  const dashboardData = [
    { title: 'Total Students', value: '150', icon: <PeopleIcon />, color: '#2e7d32' },
    { title: 'Active Subscriptions', value: '80', icon: <PaymentIcon />, color: '#0288d1' },
    { title: 'Upcoming Tournaments', value: '5', icon: <TournamentIcon />, color: '#ed6c02' },
    { title: 'Active Coaches', value: '10', icon: <CoachesIcon />, color: '#9c27b0' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Welcome to Sports Academy Admin Panel
      </Typography>
      
      <Grid container spacing={3}>
        {dashboardData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <DashboardCard
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard; 