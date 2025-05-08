import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { sportCategoryService } from '../services/api';
import { fileToBase64, getPlaceholderUrl } from '../utils/imageUtils';
import { resizeBase64Image } from '../utils/imageUtils';

// Use Cloudinary placeholder image
const PLACEHOLDER_IMAGE = getPlaceholderUrl();

const SportCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await sportCategoryService.getAllSportCategories();
      setCategories(response.data.data.sportCategories);
    } catch (err) {
      console.error('Failed to fetch sport categories:', err);
      setError(err.response?.data?.message || 'Failed to fetch sport categories');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        console.log('Processing image file:', file.name);
        
        // Convert to Base64 for preview
        let base64Image = await fileToBase64(file);
        
        // Resize image to reduce size for upload
        console.log('Resizing image...');
        base64Image = await resizeBase64Image(base64Image, 800, 800, 0.8);
        console.log('Image resized successfully');
        
        setFormData({ ...formData, sportImage: base64Image });
        setImagePreview(base64Image);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image. Please try a different file.');
      }
    } else {
      setFormData({ ...formData, sportImage: null });
      setImagePreview(null);
    }
  };

  const handleAddClick = () => {
    setDialogMode('add');
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      sportImage: null
    });
    setImagePreview(null);
    setOpenDialog(true);
  };

  const handleEditClick = (category) => {
    setDialogMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      sportImage: null
    });
    setImagePreview(category.sportImage || null); 
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setImagePreview(null);
    setFormData({ name: '', description: '', sportImage: null });
    setError('');
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory || !selectedCategory._id) return;
    try {
      setLoading(true);
      await sportCategoryService.deleteSportCategory(selectedCategory._id);
      setSnackbar({ open: true, message: 'Sport category deleted successfully', severity: 'success' });
      fetchCategories();
      setOpenDeleteDialog(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Failed to delete sport category:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete sport category', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send sportImage as Base64 directly in JSON for Cloudinary upload on server
      if (dialogMode === 'add') {
        await sportCategoryService.createSportCategory(formData);
        setSnackbar({ open: true, message: 'Sport category created successfully', severity: 'success' });
      } else {
        await sportCategoryService.updateSportCategory(selectedCategory._id, formData);
        setSnackbar({ open: true, message: 'Sport category updated successfully', severity: 'success' });
      }
      fetchCategories();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save sport category:', err);
      setError(err.response?.data?.message || 'Failed to save sport category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (loading && categories.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Sport Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}>
          Add Category
        </Button>
      </Box>

      {error && !openDialog && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {categories.length === 0 && !loading ? (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">No sport categories found.</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category._id}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Avatar 
                  src={category.sportImage || PLACEHOLDER_IMAGE}
                  alt={category.name}
                  variant="square"
                  sx={{ width: '100%', height: 140, objectFit: 'cover', bgcolor: 'grey.300' }}
                  onError={(e) => {
                    // If the image fails to load, use the placeholder
                    e.target.src = 'https://via.placeholder.com/300';
                  }}
                >
                  {!category.sportImage && <ImageIcon sx={{ fontSize: 60, color: 'grey.500'}}/>} 
                </Avatar>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description || 'No description available.'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton size="small" color="primary" onClick={() => handleEditClick(category)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(category)}><DeleteIcon /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'add' ? 'Add New Sport Category' : 'Edit Sport Category'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            {error && openDialog && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
              Upload Image (Optional)
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption">Image Preview:</Typography>
                <Avatar 
                    src={imagePreview} 
                    alt="Preview" 
                    variant="rounded" 
                    sx={{ width: 150, height: 150, margin: 'auto', mt:1, border: '1px solid lightgrey' }}
                />
              </Box>
            )}
            {(dialogMode === 'edit' && selectedCategory?.sportImage && !imagePreview) && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption">Current Image:</Typography>
                    <Avatar 
                        src={selectedCategory.sportImage} 
                        alt="Current Image" 
                        variant="rounded" 
                        sx={{ width: 150, height: 150, margin: 'auto', mt:1, border: '1px solid lightgrey' }}
                    />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Save'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the category "{selectedCategory?.name}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Delete'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SportCategories; 