import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import DietPlanForm from '../components/DietPlanForm';

const DietPlanCreate = () => {
  const navigate = useNavigate();
  
  const handleSubmitSuccess = () => {
    navigate('/diet-plans');
  };
  
  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/diet-plans')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Create New Diet Plan
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <DietPlanForm onSubmitSuccess={handleSubmitSuccess} />
      </Paper>
    </Box>
  );
};

export default DietPlanCreate; 