import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  DeleteSweep as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { notificationService, userService } from '../services/api';

const Notifications = () => {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    recipientType: 'all',
    recipientIds: [],
    priority: 'medium',
    expiresAt: ''
  });
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const [studentsRes, coachesRes] = await Promise.all([
          userService.getAllUsers({ role: 'student' }),
          userService.getAllUsers({ role: 'coach' })
        ]);
        
        setStudents(studentsRes.data.data.users || []);
        setCoaches(coachesRes.data.data.users || []);
        setUsers([...studentsRes.data.data.users, ...coachesRes.data.data.users]);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load users',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNotificationForm({ ...notificationForm, [name]: value });
  };

  // Handle recipient change for multiple select
  const handleRecipientChange = (event) => {
    setNotificationForm({
      ...notificationForm,
      recipientIds: event.target.value
    });
  };

  // Send notification
  const handleSendNotification = async () => {
    try {
      setLoading(true);
      await notificationService.createSystemNotification(notificationForm);
      
      setSnackbar({
        open: true,
        message: 'Notification sent successfully',
        severity: 'success'
      });
      
      setNotificationForm({
        title: '',
        message: '',
        recipientType: 'all',
        recipientIds: [],
        priority: 'medium',
        expiresAt: ''
      });
      
    } catch (err) {
      console.error('Failed to send notification:', err);
      setSnackbar({
        open: true,
        message: 'Failed to send notification',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation dialog
  const handleDeleteDialogOpen = () => {
    setDialogOpen(true);
  };

  // Delete all read notifications
  const handleDeleteReadNotifications = async () => {
    try {
      setLoading(true);
      await notificationService.deleteReadNotifications();
      
      setSnackbar({
        open: true,
        message: 'Read notifications deleted successfully',
        severity: 'success'
      });
      
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete notifications:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete notifications',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notifications Management
      </Typography>

      <Tabs 
        value={tab} 
        onChange={handleTabChange} 
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Send Notifications" />
        <Tab label="Notification Settings" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Send System Notification
              </Typography>
              
              <TextField
                label="Title"
                name="title"
                value={notificationForm.title}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                label="Message"
                name="message"
                value={notificationForm.message}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
              />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Recipient Type"
                    name="recipientType"
                    value={notificationForm.recipientType}
                    onChange={handleFormChange}
                    fullWidth
                    margin="normal"
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="students">All Students</MenuItem>
                    <MenuItem value="coaches">All Coaches</MenuItem>
                    <MenuItem value="specific">Specific Users</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Priority"
                    name="priority"
                    value={notificationForm.priority}
                    onChange={handleFormChange}
                    fullWidth
                    margin="normal"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Expiry Date (Optional)"
                    name="expiresAt"
                    type="datetime-local"
                    value={notificationForm.expiresAt}
                    onChange={handleFormChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                {notificationForm.recipientType === 'specific' && (
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="recipients-label">Select Recipients</InputLabel>
                      <Select
                        labelId="recipients-label"
                        multiple
                        value={notificationForm.recipientIds}
                        onChange={handleRecipientChange}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const user = users.find(u => u._id === value);
                              return (
                                <Chip 
                                  key={value} 
                                  label={user ? user.name : value} 
                                  size="small" 
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {students.length > 0 && (
                          <MenuItem disabled>
                            <em>Students</em>
                          </MenuItem>
                        )}
                        {students.map((student) => (
                          <MenuItem key={`student-${student._id}`} value={student._id}>
                            {student.name} - Student
                          </MenuItem>
                        ))}
                        
                        {coaches.length > 0 && (
                          <MenuItem disabled>
                            <em>Coaches</em>
                          </MenuItem>
                        )}
                        {coaches.map((coach) => (
                          <MenuItem key={`coach-${coach._id}`} value={coach._id}>
                            {coach.name} - Coach
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={handleSendNotification}
                  disabled={loading || !notificationForm.title || !notificationForm.message}
                >
                  Send Notification
                  {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage your notification system here. You can send system-wide notifications
                  to all users or specific groups.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Tips:</strong>
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>Use clear and concise titles</li>
                  <li>Set appropriate priorities</li>
                  <li>Target specific user groups when possible</li>
                  <li>Set expiry dates for time-sensitive notifications</li>
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteDialogOpen}
                >
                  Clear Read Notifications
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Settings for notification management will appear here in a future update.
          </Typography>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all read notifications across the system?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteReadNotifications} color="error">
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

export default Notifications; 