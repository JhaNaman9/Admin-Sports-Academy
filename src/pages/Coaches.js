import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Chip,
  IconButton,
  Button,
  Stack,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  PersonAdd as PersonAddIcon,
  SportsSoccer as SportsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { coachService, sportCategoryService } from '../services/api';
import CoachForm from '../components/CoachForm';

const Coaches = () => {
  // Add ref to track if component is mounted
  const isMounted = useRef(true);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [sportCategories, setSportCategories] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Set up effect to track component mount state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch coaches on component mount - use useCallback to stabilize the function
  const fetchCoaches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await coachService.getAllCoaches();
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setCoaches(response.data.data.coaches || []);
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      console.error('Failed to fetch coaches:', err);
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Failed to load coaches');
      }
    } finally {
      if (isMounted.current) {
      setLoading(false);
      }
    }
  }, []);

  // Fetch sport categories for display
  const fetchSportCategories = useCallback(async () => {
    try {
      const response = await sportCategoryService.getAllSportCategories();
      const categoriesMap = {};
      if (response.data.data.sportCategories) {
        response.data.data.sportCategories.forEach(cat => {
          categoriesMap[cat._id] = cat.name;
        });
      }
      if (isMounted.current) {
      setSportCategories(categoriesMap);
      }
    } catch (err) {
      console.error('Failed to fetch sport categories:', err);
    }
  }, []);

  // Use useEffect with the stable callback functions
  useEffect(() => {
    fetchCoaches();
    fetchSportCategories();
    
    // Don't call these functions repeatedly
    // This will help prevent continuous API calls
    const interval = setInterval(() => {
      // No repeated API calls here
    }, 60000); // You can set a very long interval or remove this completely
    
    return () => clearInterval(interval);
  }, [fetchCoaches, fetchSportCategories]);

  // Handle dialog closures in a more controlled way
  const handleCloseDialogs = useCallback(() => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    // Don't reset selected coach immediately to avoid react state update conflicts
    setTimeout(() => {
      if (isMounted.current) {
        setSelectedCoach(null);
      }
    }, 100);
  }, []);

  // Handle coach edit
  const handleEditClick = useCallback((coach) => {
    setSelectedCoach(coach);
    setOpenEditDialog(true);
  }, []);

  // Handle coach delete
  const handleDeleteClick = useCallback((coach) => {
    setSelectedCoach(coach);
    setOpenDeleteDialog(true);
  }, []);

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedCoach) return;
    
    try {
      setLoading(true);
      await coachService.deleteCoach(selectedCoach._id);
      
      if (isMounted.current) {
      setSnackbar({
        open: true,
        message: 'Coach deleted successfully',
        severity: 'success'
      });
      
      // Refresh coaches list
      fetchCoaches();
        handleCloseDialogs();
      }
    } catch (err) {
      console.error('Failed to delete coach:', err);
      if (isMounted.current) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete coach',
        severity: 'error'
      });
      }
    } finally {
      if (isMounted.current) {
      setLoading(false);
      }
    }
  }, [selectedCoach, fetchCoaches, handleCloseDialogs]);

  // Handle form submission success
  const handleFormSuccess = useCallback((shouldClose = true) => {
    // Refresh coaches list
    fetchCoaches();
    
    // Only close dialogs if explicitly requested
    if (shouldClose) {
      handleCloseDialogs();
    }
    
    // Show success message
    setSnackbar({
      open: true,
      message: selectedCoach ? 'Coach updated successfully' : 'Coach added successfully',
      severity: 'success'
    });
  }, [fetchCoaches, handleCloseDialogs, selectedCoach]);

  // Handle form submission error
  const handleFormError = useCallback((errorMessage) => {
    setSnackbar({
      open: true,
      message: errorMessage || 'An error occurred',
      severity: 'error'
    });
  }, []);

  // Close snackbar
  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Format phone number for display
  const formatPhoneNumber = useCallback((phone) => {
    if (!phone) return 'No phone';
    
    // Simple formatting: just return the phone string
    return phone;
  }, []);

  // Get sport info - updated to handle arrays of populated sport categories
  const getSportInfo = useCallback((coach) => {
    if (!coach.sportsCategories || coach.sportsCategories.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SportsIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            No Sports Assigned
        </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {coach.sportsCategories.map((sportCat) => {
          // Handle both populated objects and ID references
          const sportId = typeof sportCat === 'object' ? sportCat._id : sportCat;
          const sportName = 
            typeof sportCat === 'object' ? sportCat.name : 
            sportCategories[sportId] || 'Unknown Sport';
            
          return (
            <Chip
              key={sportId}
              icon={<SportsIcon fontSize="small" />}
              label={sportName}
              size="small"
              variant="outlined"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          );
        })}
      </Box>
    );
  }, [sportCategories]);

  if (loading && coaches.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Coaches
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedCoach(null); // Ensure no coach is selected for add mode
            setOpenAddDialog(true);
          }}
          sx={{ 
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' }
          }}
        >
          Add Coach
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {coaches.length === 0 && !loading ? (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No coaches found
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<PersonAddIcon />}
            onClick={() => {
              setSelectedCoach(null);
              setOpenAddDialog(true);
            }}
          >
            Add Your First Coach
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {coaches.map((coach) => (
            <Grid item xs={12} md={6} lg={4} key={coach._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                  {/* Coach header with avatar and status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          bgcolor: '#0288d1',
                          color: 'white',
                          fontSize: '1.5rem',
                          mr: 2
                        }}
                        src={coach.profileImage}
                      >
                        {coach.user?.name?.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {coach.user?.name || 'Unknown Name'}
                        </Typography>
                        {getSportInfo(coach)}
                      </Box>
                    </Box>
                    <Box>
                      <Rating 
                        value={coach.ratingAverage || 0} 
                        readOnly 
                        precision={0.5}
                      size="small"
                    />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Coach details */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      {coach.user?.email || 'No email'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      {formatPhoneNumber(coach.user?.phone)}
                    </Typography>
                  </Box>
                  
                  {/* Expertise */}
                  {coach.expertise && coach.expertise.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Expertise
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {coach.expertise.map((exp, index) => (
                            <Chip 
                              key={index}
                            label={exp}
                              size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  
                  {/* Experience */}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Experience:</strong> {coach.experienceYears || 0} years
                  </Typography>
                  
                  {/* Bio/Description */}
                  {coach.bio && (
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                      mb: 1
                        }}>
                          {coach.bio}
                        </Typography>
                  )}
                </CardContent>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  p: 1,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditClick(coach)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteClick(coach)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add/Edit Coach Dialog - Use key to force re-render */}
      <Dialog
        open={openAddDialog || openEditDialog}
        onClose={handleCloseDialogs}
        maxWidth="md"
        fullWidth
        keepMounted={false} // Don't keep dialog mounted when closed
      >
        <DialogTitle>
          {selectedCoach ? 'Edit Coach' : 'Add Coach'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialogs}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Use key with current timestamp to force CoachForm to be completely re-rendered when dialog opens */}
          {(openAddDialog || openEditDialog) && (
            <CoachForm
              key={openAddDialog ? `add-${Date.now()}` : `edit-${selectedCoach?._id}-${Date.now()}`}
              coachId={selectedCoach?._id}
              onSubmitSuccess={handleFormSuccess}
              onFormError={handleFormError}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDialogs}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete {selectedCoach?.user?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Coaches; 