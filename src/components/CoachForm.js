import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip,
  FormHelperText
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { userService, coachService, sportCategoryService } from '../services/api';

const CoachForm = ({ coachId, onSubmitSuccess, onFormError }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    bio: '',
    expertise: [],
    experienceYears: '',
    sportsCategories: [],
    certifications: []
  });
  
  const [availableSports, setAvailableSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [certification, setCertification] = useState('');
  const [expertiseItem, setExpertiseItem] = useState('');

  // Separate the sports fetching from the coach data fetching
  useEffect(() => {
    const fetchSports = async () => {
      try {
        // Use the actual API call to get sports categories
        const response = await sportCategoryService.getAllSportCategories();
        const sportsData = response.data.data.sportCategories || [];
        
        // If API call failed to return data, use fallback mock data
        if (sportsData.length === 0) {
          setAvailableSports([
            { _id: '1', name: 'Soccer' },
            { _id: '2', name: 'Basketball' },
            { _id: '3', name: 'Tennis' },
            { _id: '4', name: 'Swimming' },
            { _id: '5', name: 'Athletics' }
          ]);
        } else {
          setAvailableSports(sportsData);
        }
      } catch (err) {
        console.error('Failed to fetch sports categories:', err);
        if (onFormError) {
          onFormError('Failed to load sports categories');
        }
        // Fallback to mock data if API call fails
        setAvailableSports([
          { _id: '1', name: 'Soccer' },
          { _id: '2', name: 'Basketball' },
          { _id: '3', name: 'Tennis' },
          { _id: '4', name: 'Swimming' },
          { _id: '5', name: 'Athletics' }
        ]);
      }
    };

    fetchSports();
  }, []); // Only fetch sports once

  // Separate effect to fetch coach data when editing
  useEffect(() => {
    const fetchCoach = async () => {
      if (!coachId) return;
      
      try {
        setLoadingData(true);
        const response = await coachService.getCoachById(coachId);
        const coach = response.data.data.coach;
        
        setFormData({
          name: coach.user?.name || '',
          email: coach.user?.email || '',
          phone: coach.user?.phone || '',
          password: '',
          passwordConfirm: '',
          bio: coach.bio || '',
          expertise: coach.expertise || [],
          experienceYears: coach.experienceYears || '',
          sportsCategories: coach.sportsCategories?.map(cat => typeof cat === 'object' ? cat._id : cat) || [],
          certifications: coach.certifications || []
        });
      } catch (err) {
        console.error('Failed to fetch coach data:', err);
        setError('Failed to load coach data');
        if (onFormError) {
          onFormError('Failed to load coach data');
        }
      } finally {
        setLoadingData(false);
      }
    };

    fetchCoach();
  }, [coachId, onFormError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addExpertise = () => {
    if (expertiseItem.trim() === '') return;
    
    setFormData({
      ...formData,
      expertise: [...formData.expertise, expertiseItem]
    });
    setExpertiseItem('');
  };

  const removeExpertise = (index) => {
    const updatedExpertise = [...formData.expertise];
    updatedExpertise.splice(index, 1);
    setFormData({ ...formData, expertise: updatedExpertise });
  };

  const addCertification = () => {
    if (certification.trim() === '') return;
    
    setFormData({
      ...formData,
      certifications: [...formData.certifications, { name: certification, issuedBy: '', year: null }]
    });
    setCertification('');
  };

  const removeCertification = (index) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications.splice(index, 1);
    setFormData({ ...formData, certifications: updatedCertifications });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ensure form doesn't auto-submit
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    setError('');
    setSuccess('');
    
    // Basic validation checks
    if (!formData.name || !formData.email) {
      const msg = 'Name and email are required.';
      setError(msg);
      if (onFormError) onFormError(msg);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      const msg = 'Invalid email format.';
      setError(msg);
      if (onFormError) onFormError(msg);
      return;
    }
    
    if (!coachId && !formData.password) {
      const msg = 'Password is required for new coaches.';
      setError(msg);
      if (onFormError) onFormError(msg);
      return;
    }
    
    if (formData.password && formData.password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setError(msg);
      if (onFormError) onFormError(msg);
      return;
    }
    
    if (formData.password !== formData.passwordConfirm) {
      const msg = 'Passwords do not match.';
      setError(msg);
      if (onFormError) onFormError(msg);
      return;
    }
    
    // Sports categories validation - required in backend schema
    if (!formData.sportsCategories || formData.sportsCategories.length === 0) {
      const msg = 'Please select at least one sport category.';
      setError(msg);
      if (onFormError) onFormError(msg);
      return;
    }
    
    if (formData.experienceYears && (isNaN(Number(formData.experienceYears)) || Number(formData.experienceYears) < 0)) {
      const msg = 'Experience years must be a valid non-negative number.';
      setError(msg);
      if (onFormError) onFormError(msg);
      return;
    }
    
    try {
      setLoading(true);
      
      if (coachId) {
        // Update existing coach
        const coachData = {
          bio: formData.bio,
          expertise: formData.expertise,
          experienceYears: formData.experienceYears,
          sportsCategories: formData.sportsCategories,
          certifications: formData.certifications
        };
        
        await coachService.updateCoach(coachId, coachData);
        
        // Update user information separately if needed
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };
        
        if (formData.password) {
          userData.password = formData.password;
          userData.passwordConfirm = formData.password;
        }
        
        // Assuming we have the coach's user ID from the fetched coach data
        await userService.updateUser(coachId, userData);
        
        setSuccess('Coach updated successfully!');
        
        // Notify parent of success
        if (onSubmitSuccess) {
          onSubmitSuccess(true); // true to close the dialog
        }
      } else {
        // Create new coach with user account
        // Step 1: Create user with coach role
        const userResponse = await userService.createUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          passwordConfirm: formData.password, // Use same value to ensure match
          role: 'coach',
          approved: true
        });
        
        // Step 2: Create coach profile linked to user
        if (userResponse && userResponse.data && userResponse.data.data && userResponse.data.data.user) {
          const userId = userResponse.data.data.user._id;
          
          await coachService.createCoach({
            user: userId,
            bio: formData.bio,
            expertise: formData.expertise,
            experienceYears: formData.experienceYears,
            sportsCategories: formData.sportsCategories,
            certifications: formData.certifications
          });
          
          setSuccess('Coach added successfully! You can close this dialog or add another coach.');
          
          // Clear form for adding another coach
          setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            passwordConfirm: '',
            bio: '',
            expertise: [],
            experienceYears: '',
            sportsCategories: [],
            certifications: []
          });
          
          // Notify parent to refresh the list but don't auto-close
          if (onSubmitSuccess) {
            onSubmitSuccess(false); // Pass false to indicate don't close the dialog
          }
        } else {
          throw new Error('Failed to create user account');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      if (onFormError) {
        onFormError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper component="form" noValidate onSubmit={handleSubmit} sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Typography variant="h6" gutterBottom>
        {coachId ? 'Edit Coach Profile' : 'Add New Coach'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
        Account Information
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label={coachId ? "New Password (leave blank to keep current)" : "Password *"}
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required={!coachId}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label={coachId ? "Confirm New Password" : "Confirm Password *"}
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required={!coachId}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Professional Information
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth error={formData.sportsCategories.length === 0}>
            <InputLabel id="sports-categories-label">Sports Categories *</InputLabel>
            <Select
              labelId="sports-categories-label"
              multiple
              value={formData.sportsCategories}
              onChange={handleChange}
              name="sportsCategories"
              label="Sports Categories *"
              required
              error={formData.sportsCategories.length === 0}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected || []).map((value) => {
                    const sport = availableSports.find(s => s._id === value);
                    return <Chip key={value} label={sport ? sport.name : value} size="small"/>;
                  })}
                </Box>
              )}
            >
              {loadingData && availableSports.length === 0 && <MenuItem disabled><em>Loading sports...</em></MenuItem>}
              {!loadingData && availableSports.length === 0 && <MenuItem disabled><em>No sports categories available.</em></MenuItem>}
              {availableSports.map((sport) => (
                <MenuItem key={sport._id} value={sport._id}>
                  {sport.name}
                </MenuItem>
              ))}
            </Select>
            {formData.sportsCategories.length === 0 && 
              <FormHelperText error>At least one sport category is required</FormHelperText>
            }
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            label="Experience (years)"
            name="experienceYears"
            type="number"
            value={formData.experienceYears}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Expertise</Typography>
          </Box>
          
          <Box sx={{ display: 'flex' }}>
            <TextField
              label="Add Expertise"
              value={expertiseItem}
              onChange={(e) => setExpertiseItem(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button 
              variant="contained" 
              sx={{ ml: 1, mt: 2 }}
              onClick={addExpertise}
            >
              Add
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {formData.expertise.map((qual, index) => (
              <Chip
                key={index}
                label={qual}
                onDelete={() => removeExpertise(index)}
                color="primary"
                variant="outlined"
              />
            ))}
            {formData.expertise.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No expertise added yet
              </Typography>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Certifications</Typography>
          </Box>
          
          <Box sx={{ display: 'flex' }}>
            <TextField
              label="Add Certification"
              value={certification}
              onChange={(e) => setCertification(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button 
              variant="contained" 
              sx={{ ml: 1, mt: 2 }}
              onClick={addCertification}
            >
              Add
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {formData.certifications.map((qual, index) => (
              <Chip
                key={index}
                label={qual.name}
                onDelete={() => removeCertification(index)}
                color="primary"
                variant="outlined"
              />
            ))}
            {formData.certifications.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No certifications added yet
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          type="button" // Changed from 'submit'
          variant="outlined"
          color="secondary"
          disabled={loading}
          onClick={() => {
            if (onSubmitSuccess) onSubmitSuccess(true);
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
          disabled={loading}
        >
          {loading ? 'Saving...' : (coachId ? 'Update Coach' : 'Add Coach')}
        </Button>
      </Box>
    </Paper>
  );
};

export default CoachForm; 