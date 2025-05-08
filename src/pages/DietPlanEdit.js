import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import DietPlanForm from '../components/DietPlanForm';

const DietPlanEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handleSubmitSuccess = () => {
    navigate('/diet-plans');
  };
  
  if (!id) {
    navigate('/diet-plans');
    return null;
  }
  
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
          Edit Diet Plan
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <DietPlanForm dietPlanId={id} onSubmitSuccess={handleSubmitSuccess} />
      </Paper>
    </Box>
  );
};

export default DietPlanEdit; 