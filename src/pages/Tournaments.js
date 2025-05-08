import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Container,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Event as EventIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  CalendarMonth as CalendarMonthIcon,
  LocationOn as LocationOnIcon,
  Sports as SportsIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { tournamentService, sportCategoryService, authService } from '../services/api';
import { format } from 'date-fns';
import { fileToBase64, getPlaceholderUrl, resizeBase64Image } from '../utils/imageUtils';

// Use Cloudinary placeholder image
const PLACEHOLDER_IMAGE = getPlaceholderUrl();

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [sportCategories, setSportCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportCategory: '',
    startDate: null,
    endDate: null,
    registrationDeadline: null,
    location: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: ''
      }
    },
    maxParticipants: '',
    formUrl: '',
    tournamentImage: null,
    organizer: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Add a success message state
  const [successMessage, setSuccessMessage] = useState('');

  // Add autosave functionality for the form
  const FORM_AUTOSAVE_KEY = 'tournament_form_autosave';

  // Add a new state for tracking if the form has been modified
  const [formModified, setFormModified] = useState(false);

  // Load current user info when component mounts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData && userData.data && userData.data.data && userData.data.data.user && typeof userData.data.data.user === 'object') {
          setCurrentUser(userData.data.data.user);
        } else {
          setCurrentUser(null);
          console.error('Tournaments.js: Failed to get valid user object from authService.getCurrentUser. UserData:', userData);
        }
      } catch (err) {
        console.error('Tournaments.js: Error fetching current user:', err);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  // Load saved form data when the component mounts
  useEffect(() => {
    const savedForm = localStorage.getItem(FORM_AUTOSAVE_KEY);
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        
        // Convert string dates back to Date objects
        if (parsedForm.startDate) parsedForm.startDate = new Date(parsedForm.startDate);
        if (parsedForm.endDate) parsedForm.endDate = new Date(parsedForm.endDate);
        if (parsedForm.registrationDeadline) parsedForm.registrationDeadline = new Date(parsedForm.registrationDeadline);
        
        // Don't restore image as it can't be serialized properly
        parsedForm.tournamentImage = null;
        
        console.log('Loaded saved form data:', parsedForm);
      } catch (err) {
        console.error('Error loading saved form data:', err);
        localStorage.removeItem(FORM_AUTOSAVE_KEY);
      }
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    if (openDialog) {
      const formToSave = { ...formData };
      
      // Convert Date objects to ISO strings for storage
      if (formToSave.startDate) formToSave.startDate = formToSave.startDate.toISOString();
      if (formToSave.endDate) formToSave.endDate = formToSave.endDate.toISOString();
      if (formToSave.registrationDeadline) formToSave.registrationDeadline = formToSave.registrationDeadline.toISOString();
      
      // Remove the image as it can't be serialized
      formToSave.tournamentImage = null;
      
      try {
        localStorage.setItem(FORM_AUTOSAVE_KEY, JSON.stringify(formToSave));
      } catch (err) {
        console.error('Error saving form data:', err);
      }
    }
  }, [formData, openDialog]);

  // Clear saved form data after successful submission
  const clearSavedFormData = () => {
    localStorage.removeItem(FORM_AUTOSAVE_KEY);
  };

  // Implement a function to keep the session active
  const keepSessionActive = () => {
    // This is a no-op function that gets called periodically 
    // to prevent session timeouts
    console.log('Keeping session active:', new Date().toISOString());
  };

  // Use an interval to keep the session active
  useEffect(() => {
    // Call every 4 minutes to prevent typical 5-minute session timeouts
    const intervalId = setInterval(keepSessionActive, 240000);
    
    // Clean up
    return () => clearInterval(intervalId);
  }, []);

  // Fetch tournaments and sport categories on component mount
  useEffect(() => {
    fetchTournaments();
    fetchSportCategories();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      
      // First check if user is authenticated as admin
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setError('You must be logged in to view tournaments');
        setTournaments([]);
        return;
      }
      
      const response = await tournamentService.getAllTournaments();
      
      // Validate response structure
      if (!response.data || !response.data.data) {
        console.error('Invalid response structure:', response);
        setError('Failed to fetch tournaments: Invalid response format');
        setTournaments([]);
        return;
      }
      
      const tournamentData = response.data.data.tournaments || [];
      
      // Process tournaments to ensure all required fields have default values
      const processedTournaments = tournamentData.map(tournament => ({
        ...tournament,
        name: tournament.name || 'Unnamed Tournament',
        description: tournament.description || '',
        sportCategory: tournament.sportCategory || { _id: '', name: 'Uncategorized' },
        location: tournament.location || { name: '', address: {} },
        organizer: tournament.organizer || { _id: '', name: 'Unknown' }
      }));
      
      console.log('Processed tournaments:', processedTournaments);
      setTournaments(processedTournaments);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError(err.response?.data?.message || 'Failed to fetch tournaments');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSportCategories = async () => {
    try {
      const response = await sportCategoryService.getAllSportCategories();
      setSportCategories(response.data.data.sportCategories || []);
    } catch (err) {
      console.error('Error fetching sport categories:', err);
    }
  };

  // Update handleInputChange to mark the form as modified
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormModified(true); // Mark as modified
    
    // Handle nested fields
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

  // Update handleAddressChange to mark the form as modified
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormModified(true); // Mark as modified
    
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        address: {
          ...formData.location.address,
          [name]: value
        }
      }
    });
  };

  // Update handleDateChange to mark the form as modified
  const handleDateChange = (field, date) => {
    setFormModified(true); // Mark as modified
    
    setFormData({
      ...formData,
      [field]: date
    });
  };

  // Update handleFileChange to use Base64 for Cloudinary upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormModified(true); // Mark as modified
      
      try {
        console.log('Processing image file:', file.name, 'size:', Math.round(file.size / 1024), 'KB');
        
        // Convert file to Base64 for preview and upload
        const base64Image = await fileToBase64(file);
        
        // Resize the image to reduce upload size (max width 1200px, quality 0.7)
        console.log('Resizing image for upload...');
        const resizedImage = await resizeBase64Image(base64Image, 1200, 1200, 0.7);
        console.log('Image resized successfully');
        
        // Calculate size reduction
        const originalSize = base64Image.length;
        const newSize = resizedImage.length;
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        console.log(`Image size reduced by ${reduction}% (${Math.round(originalSize/1024)} KB → ${Math.round(newSize/1024)} KB)`);
        
        // Update form data with resized image
        setFormData({
          ...formData,
          tournamentImage: resizedImage
        });
        
        console.log('Image added to form data');
      } catch (error) {
        console.error('Error processing image:', error);
        setError(`Failed to process image: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Log current form state for debugging
    console.log('Validating form data:', formData);
    
    // Basic required field validation
    if (!formData.name) errors.name = 'Tournament name is required';
    if (!formData.sportCategory) errors.sportCategory = 'Sport category is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (!formData.registrationDeadline) errors.registrationDeadline = 'Registration deadline is required';
    if (!formData.location.name) errors['location.name'] = 'Location name is required';
    
    // Only validate organizer when adding a new tournament
    if (formMode === 'add' && !formData.organizer) {
      errors.organizer = 'Organizer is required';
    }
    
    // When editing, make sure we have the tournament ID
    if (formMode === 'edit' && (!selectedTournament || !selectedTournament._id)) {
      errors.id = 'Tournament ID is missing - cannot update';
    }
    
    // Validate dates
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    if (formData.startDate && formData.registrationDeadline && formData.registrationDeadline > formData.startDate) {
      errors.registrationDeadline = 'Registration deadline must be before start date';
    }

    // If we have errors, log them for debugging
    if (Object.keys(errors).length > 0) {
      console.error('Form validation failed with errors:', errors);
    } else {
      console.log('Form validation passed successfully');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTournament = () => {
    if (!currentUser || !currentUser._id) {
      alert('User data is not yet loaded. Please wait a moment and try again.');
      return;
    }
    setFormMode('add');
    
    // Initialize base form data
    initializeFormData(); 

    // Ensure organizer is set correctly from current user AFTER initialization
    setFormData(prevData => ({
      ...prevData,
      name: '', // Explicitly reset fields that might be from localStorage restore
      description: '',
      sportCategory: '',
      startDate: null,
      endDate: null,
      registrationDeadline: null,
      location: {
        name: '',
        address: { street: '', city: '', state: '', country: '' }
      },
      maxParticipants: '',
      formUrl: '',
      tournamentImage: null,
      organizer: currentUser._id // Crucial: Set organizer from the loaded admin user
    }));

    // Check for saved form data (but prioritize fresh currentUser for organizer)
    const savedForm = localStorage.getItem(FORM_AUTOSAVE_KEY);
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        if (window.confirm('We found a previously unsaved tournament form. Would you like to restore it?')) {
          if (parsedForm.startDate) parsedForm.startDate = new Date(parsedForm.startDate);
          if (parsedForm.endDate) parsedForm.endDate = new Date(parsedForm.endDate);
          if (parsedForm.registrationDeadline) parsedForm.registrationDeadline = new Date(parsedForm.registrationDeadline);
          
          setFormData(prevData => ({
            ...parsedForm, // Load saved data
            tournamentImage: null, // Don't restore image
            organizer: prevData.organizer // Keep the organizer from currentUser set above
          }));
        } else {
          clearSavedFormData();
          // formData is already re-initialized with currentUser._id as organizer
        }
      } catch (err) {
        console.error('Error restoring saved form:', err);
        clearSavedFormData();
        // formData is already re-initialized with currentUser._id as organizer
      }
    } 
    
    setFormErrors({});
    setFormModified(false); // Reset modified state for a fresh form
    setOpenDialog(true);
  };

  const handleEditTournament = (tournament) => {
    console.log('Editing tournament:', tournament);
    
    if (!tournament) {
      console.error('Tournament is null or undefined');
      setError('Cannot edit tournament: Invalid data');
      return;
    }
    
    if (!tournament._id) {
      console.error('Tournament ID is missing', tournament);
      setError('Cannot edit tournament: Missing ID');
      return;
    }
    
    setFormMode('edit');
    setSelectedTournament(tournament);
    
    try {
      // Parse location if it's a string (which can happen when data comes from the API)
      let locationObj = tournament.location;
      if (typeof tournament.location === 'string') {
        try {
          locationObj = JSON.parse(tournament.location);
          console.log('Successfully parsed location string to object:', locationObj);
        } catch (e) {
          console.error('Failed to parse location string:', e);
          locationObj = { name: '', address: {} };
        }
      }
      
      // Ensure location has the expected structure
      if (!locationObj) {
        locationObj = { name: '', address: {} };
      }
      
      if (!locationObj.address) {
        locationObj.address = {};
      }
      
      console.log('Processed location object:', locationObj);
      
      setFormData({
        name: tournament.name || '',
        description: tournament.description || '',
        sportCategory: tournament.sportCategory?._id || '',
        startDate: tournament.startDate ? new Date(tournament.startDate) : null,
        endDate: tournament.endDate ? new Date(tournament.endDate) : null,
        registrationDeadline: tournament.registrationDeadline ? new Date(tournament.registrationDeadline) : null,
        location: {
          name: locationObj.name || '',
          address: {
            street: locationObj.address?.street || '',
            city: locationObj.address?.city || '',
            state: locationObj.address?.state || '',
            country: locationObj.address?.country || ''
          }
        },
        maxParticipants: tournament.maxParticipants || '',
        formUrl: tournament.formUrl || '',
        tournamentImage: null,
        organizer: tournament.organizer?._id || (currentUser?._id || '')
      });
      
      console.log('Form data set for editing', { 
        name: tournament.name, 
        sportCategory: tournament.sportCategory?._id,
        organizer: tournament.organizer?._id
      });
      
      setFormErrors({});
      setOpenDialog(true);
      setFormModified(false); // Reset modified state when opening the form
    } catch (error) {
      console.error('Error setting up tournament edit form:', error);
      setError('Failed to prepare tournament data for editing');
    }
  };

  const handleDeleteTournament = async (id) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await tournamentService.deleteTournament(id);
        // Refresh the tournaments list
        fetchTournaments();
      } catch (err) {
        console.error('Error deleting tournament:', err);
        setError('Failed to delete tournament');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Validation failed - form will stay open. Errors:', formErrors);
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create a copy of the form data to send
      const submissionData = { ...formData };
      
      // Debug: Log the raw form data before any transformations
      console.log('Raw form data before processing:', JSON.stringify(formData, null, 2));
      
      // Handle dates
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] instanceof Date) {
          submissionData[key] = submissionData[key].toISOString();
        }
      });
      
      // Special handling for location to fix common update issues
      // Make sure location exists and has required structure
      if (!submissionData.location) {
        submissionData.location = { name: '', address: {} };
      }
      
      // Make sure address object exists
      if (!submissionData.location.address) {
        submissionData.location.address = {};
      }
      
      // Ensure address fields are strings, not undefined
      const addressFields = ['street', 'city', 'state', 'country'];
      addressFields.forEach(field => {
        if (!submissionData.location.address[field]) {
          submissionData.location.address[field] = '';
        }
      });
      
      // Debug: Check location object before stringifying
      console.log('Location object before stringify:', submissionData.location);
      
      // Convert location object to proper format
      if (submissionData.location && typeof submissionData.location === 'object') {
        // Always ensure these fields exist to prevent backend validation errors
        if (!submissionData.location.name) {
          submissionData.location.name = '';
        }
        
        // Ensure address object is properly structured
        if (!submissionData.location.address) {
          submissionData.location.address = {};
        }
        
        try {
          submissionData.location = JSON.stringify(submissionData.location);
        } catch (error) {
          console.error('Error stringifying location:', error);
          // If stringify fails, use a default valid structure
          submissionData.location = JSON.stringify({
            name: submissionData.location.name || '',
            address: {
              street: '',
              city: '',
              state: '',
              country: ''
            }
          });
        }
      }
      
      // Additional validation for edit mode
      if (formMode === 'edit') {
        // Make sure we have the tournament ID
        if (!selectedTournament || !selectedTournament._id) {
          throw new Error('Cannot update tournament: Missing tournament ID');
        }
        
        console.log('Updating tournament with ID:', selectedTournament._id);
        console.log('Update data (after processing):', submissionData);
      } else {
        console.log('Creating new tournament with data:', submissionData);
      }
      
      let response;
      if (formMode === 'add') {
        response = await tournamentService.createTournament(submissionData);
        console.log('Tournament created successfully, response:', response);
      } else {
        // Additional debug for update
        console.log(`Making API call to update tournament ${selectedTournament._id} with data:`, {
          ...submissionData,
          location: typeof submissionData.location === 'string' 
            ? JSON.parse(submissionData.location) 
            : submissionData.location
        });
        
        // Extra validation before update
        if (!selectedTournament?._id) {
          throw new Error('Cannot update tournament: missing ID');
        }
        
        // Ensure ID is a valid format (MongoDB ObjectId is 24 hex characters)
        const idStr = String(selectedTournament._id);
        if (!/^[0-9a-fA-F]{24}$/.test(idStr)) {
          console.error('Invalid tournament ID format:', idStr);
          throw new Error('Invalid tournament ID format');
        }
        
        try {
          response = await tournamentService.updateTournament(selectedTournament._id, submissionData);
          console.log('Tournament updated successfully, response:', response);
        } catch (updateError) {
          console.error('Error in updateTournament API call:', updateError);
          throw updateError;
        }
      }
      
      // Close dialog and refresh tournaments
      setOpenDialog(false);
      await fetchTournaments(); // Use await to ensure the list is refreshed before showing success message

      // Reset form data
      initializeFormData();

      // Reset modified state
      setFormModified(false);

      // Show success message
      setError(''); // Clear any previous errors
      setSuccessMessage(formMode === 'add' ? 'Tournament created successfully!' : 'Tournament updated successfully!');

      // After 5 seconds, clear the success message
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      console.error('Error saving tournament:', err);
      let errorMessage = 'Failed to save tournament. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        console.error('API error response:', err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Log detailed error information for debugging
      if (err.response) {
        console.error('Response error data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming':
        return '#0288d1';
      case 'registration_open':
        return '#ed6c02';
      case 'in_progress':
        return '#9c27b0';
      case 'completed':
        return '#2e7d32';
      case 'cancelled':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Extract the form initialization to a reusable function
  const initializeFormData = () => {
    setFormData({
      name: '',
      description: '',
      sportCategory: '',
      startDate: null,
      endDate: null,
      registrationDeadline: null,
      location: {
        name: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: ''
        }
      },
      maxParticipants: '',
      formUrl: '',
      tournamentImage: null,
      organizer: currentUser ? currentUser._id : '' // Attempt to set organizer if currentUser is available
    });
  };

  // Create a function to handle dialog close
  const handleCloseDialog = () => {
    // Check if the form has unsaved changes
    if (formModified) {
      // Ask for confirmation before closing
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close this form?');
      if (!confirmClose) {
        return; // Don't close if the user cancels
      }
    }
    
    // Close the dialog
    setOpenDialog(false);
    setFormModified(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Tournaments
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddTournament}
          sx={{ 
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' }
          }}
        >
          Add Tournament
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        tournaments.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', mt: 3 }}>
            <Typography variant="h6" color="text.secondary">No tournaments found.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click the Add Tournament button to create your first tournament.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {tournaments.map((tournament) => (
              <Grid item xs={12} sm={6} md={6} key={tournament._id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  {/* Image Section */}
                  <Box sx={{ position: 'relative', pt: '40%' }}>
                    <Avatar
                      variant="square"
                      src={tournament.tournamentImage || PLACEHOLDER_IMAGE}
                      alt={tournament.name}
                      onError={(e) => {
                        console.log('Image failed to load:', tournament.tournamentImage);
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                        objectFit: 'cover'
                      }}
                    >
                      {!tournament.tournamentImage && <ImageIcon sx={{ fontSize: 60 }} />}
                    </Avatar>
                  </Box>

                  {/* Content Section */}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {tournament.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {tournament.description?.substring(0, 100) || 'No description available'}
                      {tournament.description?.length > 100 ? '...' : ''}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {tournament.location?.name || 'Location not specified'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SportsIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {tournament.sportCategory?.name || 'Sport not specified'}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  {/* Actions Section */}
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                    <IconButton size="small" color="primary" onClick={() => handleEditTournament(tournament)}>
                      <EditIcon />
                  </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteTournament(tournament._id)}>
                      <DeleteIcon />
                  </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* Tournament Add/Edit Dialog */}
      <Dialog 
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={true}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        BackdropProps={{
          onClick: (e) => e.stopPropagation() // Prevent backdrop clicks from closing
        }}
      >
        <DialogTitle>
          {formMode === 'add' ? 'Add New Tournament' : 'Edit Tournament'}
        </DialogTitle>
        <DialogContent dividers sx={{ overflowY: 'auto' }}>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Tournament Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!formErrors.sportCategory}>
                  <InputLabel id="sport-category-label">Sport Category *</InputLabel>
                  <Select
                    labelId="sport-category-label"
                    id="sportCategory"
                    name="sportCategory"
                    value={formData.sportCategory}
                    onChange={handleInputChange}
                    label="Sport Category *"
                  >
                    {sportCategories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.sportCategory && (
                    <FormHelperText>{formErrors.sportCategory}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="description"
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Registration Deadline *"
                  value={formData.registrationDeadline}
                  onChange={(date) => handleDateChange('registrationDeadline', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: !!formErrors.registrationDeadline,
                      helperText: formErrors.registrationDeadline,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Start Date *"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: !!formErrors.startDate,
                      helperText: formErrors.startDate,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="End Date *"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: !!formErrors.endDate,
                      helperText: formErrors.endDate,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="location-name"
                  label="Location Name"
                  name="location.name"
                  value={formData.location.name}
                  onChange={handleInputChange}
                  error={!!formErrors['location.name']}
                  helperText={formErrors['location.name']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="maxParticipants"
                  label="Maximum Participants"
                  name="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="street"
                  label="Street"
                  name="street"
                  value={formData.location.address.street}
                  onChange={handleAddressChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="city"
                  label="City"
                  name="city"
                  value={formData.location.address.city}
                  onChange={handleAddressChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="state"
                  label="State/Province"
                  name="state"
                  value={formData.location.address.state}
                  onChange={handleAddressChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="country"
                  label="Country"
                  name="country"
                  value={formData.location.address.country}
                  onChange={handleAddressChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="formUrl"
                  label="Google Form URL for Registration"
                  name="formUrl"
                  value={formData.formUrl}
                  onChange={handleInputChange}
                  placeholder="https://forms.google.com/..."
                />
                <FormHelperText>
                  Provide a Google Form URL for participants to register for this tournament
                </FormHelperText>
              </Grid>
              
              {/* Image Upload Section with Preview */}
              <Grid item xs={12} sx={{ mt: 2, mb: 2 }}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>Tournament Banner Image</Typography>
                  
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<EventIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Tournament Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  
                  {formData.tournamentImage && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Image Preview:
                      </Typography>
                      <Box 
                        component="img"
                        src={formData.tournamentImage}
                        alt="Tournament banner preview"
                        sx={{ 
                          width: '100%',
                          maxHeight: '200px',
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #ddd'
                        }}
                      />
                    </Box>
                  )}
                  
                  {formMode === 'edit' && selectedTournament?.tournamentImage && !formData.tournamentImage && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Current Banner Image:
                      </Typography>
                      <Box 
                        component="img"
                        src={selectedTournament.tournamentImage}
                        alt="Current tournament banner"
                        sx={{ 
                          width: '100%',
                          maxHeight: '200px',
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #ddd'
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
            
            {/* Hidden organizer field - we'll set it automatically */}
            <input 
              type="hidden" 
              name="organizer" 
              value={formData.organizer || (currentUser ? currentUser._id : '')} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleCloseDialog}
            disabled={submitting}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            color="primary"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : (formMode === 'add' ? 'Create Tournament' : 'Update Tournament')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tournaments; 