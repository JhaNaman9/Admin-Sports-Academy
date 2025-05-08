import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  MenuItem, 
  Paper,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { dietPlanService, coachService } from '../services/api';

const DietPlanForm = ({ dietPlanId, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coach: '',
    caloriesPerDay: '',
    proteinPerDay: '',
    carbsPerDay: '',
    fatPerDay: '',
    duration: {
      value: '',
      unit: 'weeks'
    },
    meals: [],
    hydration: {
      waterIntake: {
        amount: '',
        unit: 'liters'
      },
      recommendations: []
    },
    specialInstructions: [],
    restrictions: [],
  });
  
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentMeal, setCurrentMeal] = useState({
    name: '',
    time: '',
    description: '',
    foods: []
  });
  const [currentFood, setCurrentFood] = useState({
    name: '',
    quantity: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: ''
  });

  // Fetch coaches on component mount
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await coachService.getAllCoaches();
        setCoaches(response.data.data.coaches);
      } catch (err) {
        console.error('Failed to fetch coaches:', err);
      }
    };

    fetchCoaches();
  }, []);

  // Fetch diet plan data if editing
  useEffect(() => {
    if (dietPlanId) {
      const fetchDietPlan = async () => {
        try {
          setLoading(true);
          const response = await dietPlanService.getDietPlanById(dietPlanId);
          setFormData(response.data.data.dietPlan);
        } catch (err) {
          console.error('Failed to fetch diet plan:', err);
          setError('Failed to load diet plan data');
        } finally {
          setLoading(false);
        }
      };

      fetchDietPlan();
    }
  }, [dietPlanId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle meal input changes
  const handleMealChange = (e) => {
    const { name, value } = e.target;
    setCurrentMeal({
      ...currentMeal,
      [name]: value
    });
  };

  // Handle food input changes
  const handleFoodChange = (e) => {
    const { name, value } = e.target;
    setCurrentFood({
      ...currentFood,
      [name]: value
    });
  };

  // Add food to current meal
  const handleAddFood = () => {
    if (!currentFood.name || !currentFood.quantity) return;
    
    setCurrentMeal({
      ...currentMeal,
      foods: [...currentMeal.foods, currentFood]
    });
    
    setCurrentFood({
      name: '',
      quantity: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      notes: ''
    });
  };

  // Add meal to diet plan
  const handleAddMeal = () => {
    if (!currentMeal.name) return;
    
    setFormData({
      ...formData,
      meals: [...formData.meals, currentMeal]
    });
    
    setCurrentMeal({
      name: '',
      time: '',
      description: '',
      foods: []
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (dietPlanId) {
        await dietPlanService.updateDietPlan(dietPlanId, formData);
      } else {
        await dietPlanService.createDietPlan(formData);
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      console.error('Failed to save diet plan:', err);
      setError('Failed to save diet plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Coach"
              name="coach"
              value={formData.coach}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
            >
              {coaches.map((coach) => (
                <MenuItem key={coach._id} value={coach._id}>
                  {coach.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Nutritional Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Calories (kcal)"
              name="caloriesPerDay"
              type="number"
              value={formData.caloriesPerDay}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Protein (g)"
              name="proteinPerDay"
              type="number"
              value={formData.proteinPerDay}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Carbs (g)"
              name="carbsPerDay"
              type="number"
              value={formData.carbsPerDay}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Fat (g)"
              name="fatPerDay"
              type="number"
              value={formData.fatPerDay}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              label="Duration Value"
              name="duration.value"
              type="number"
              value={formData.duration.value}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              select
              label="Duration Unit"
              name="duration.unit"
              value={formData.duration.unit}
              onChange={handleChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="days">Days</MenuItem>
              <MenuItem value="weeks">Weeks</MenuItem>
              <MenuItem value="months">Months</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Meals
        </Typography>
        
        {/* List of added meals */}
        {formData.meals && formData.meals.length > 0 && (
          <List sx={{ mb: 3 }}>
            {formData.meals.map((meal, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`${meal.name} ${meal.time ? `(${meal.time})` : ''}`}
                  secondary={`${meal.foods.length} foods | ${meal.description || 'No description'}`}
                />
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      meals: formData.meals.filter((_, i) => i !== index)
                    });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
        
        {/* Add new meal form */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Meal Name"
              name="name"
              value={currentMeal.name}
              onChange={handleMealChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Time (e.g. 8:00 AM)"
              name="time"
              value={currentMeal.time}
              onChange={handleMealChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Meal Description"
              name="description"
              value={currentMeal.description}
              onChange={handleMealChange}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Add Foods to Meal
        </Typography>
        
        {/* List of added foods for current meal */}
        {currentMeal.foods && currentMeal.foods.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {currentMeal.foods.map((food, index) => (
              <Chip
                key={index}
                label={`${food.name} (${food.quantity})`}
                onDelete={() => {
                  setCurrentMeal({
                    ...currentMeal,
                    foods: currentMeal.foods.filter((_, i) => i !== index)
                  });
                }}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        )}
        
        {/* Add new food form */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Food Name"
              name="name"
              value={currentFood.name}
              onChange={handleFoodChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Quantity (e.g. 100g)"
              name="quantity"
              value={currentFood.quantity}
              onChange={handleFoodChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Calories"
              name="calories"
              type="number"
              value={currentFood.calories}
              onChange={handleFoodChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={12}>
            <Button
              variant="outlined"
              onClick={handleAddFood}
              startIcon={<AddIcon />}
              disabled={!currentFood.name || !currentFood.quantity}
            >
              Add Food to Meal
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddMeal}
            startIcon={<AddIcon />}
            disabled={!currentMeal.name || currentMeal.foods.length === 0}
          >
            Add Meal to Diet Plan
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !formData.title || !formData.coach}
        >
          {dietPlanId ? 'Update Diet Plan' : 'Create Diet Plan'}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DietPlanForm;