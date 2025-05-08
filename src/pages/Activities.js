import React, { useState, useEffect } from 'react';
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
  TablePagination,
  Button,
  Grid,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  BarChart as StatsIcon
} from '@mui/icons-material';
import { activityService, studentService } from '../services/api';
import { format } from 'date-fns';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    activityType: '',
    studentId: ''
  });
  const [students, setStudents] = useState([]);
  const [activityStats, setActivityStats] = useState([]);

  // Activity types for filtering
  const activityTypes = [
    { value: 'training', label: 'Training' },
    { value: 'match', label: 'Match' },
    { value: 'practice', label: 'Practice' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'recovery', label: 'Recovery' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch activities and students on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activitiesResponse, studentsResponse] = await Promise.all([
          activityService.getAllActivities(),
          studentService.getAllStudents()
        ]);
        
        setActivities(activitiesResponse.data.data.activities);
        setStudents(studentsResponse.data.data.students);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch activity stats
  const fetchActivityStats = async () => {
    try {
      setLoading(true);
      const response = await activityService.getActivityStats(filters);
      setActivityStats(response.data.data.stats);
      setStatsDialogOpen(true);
    } catch (err) {
      console.error('Failed to fetch activity stats:', err);
      setError('Failed to load activity statistics');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      const response = await activityService.getAllActivities(filters);
      setActivities(response.data.data.activities);
    } catch (err) {
      console.error('Failed to apply filters:', err);
      setError('Failed to filter activities');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view activity
  const handleViewActivity = (activity) => {
    setSelectedActivity(activity);
    setViewDialogOpen(true);
  };

  // Handle delete activity
  const handleDeleteClick = (activity) => {
    setSelectedActivity(activity);
    setDeleteDialogOpen(true);
  };

  // Confirm delete activity
  const handleConfirmDelete = async () => {
    try {
      await activityService.deleteActivity(selectedActivity._id);
      setActivities(activities.filter(a => a._id !== selectedActivity._id));
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete activity:', err);
      setError('Failed to delete activity');
    }
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins}m`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return dateString;
    }
  };

  if (loading && activities.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Activity Management
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<StatsIcon />}
          onClick={fetchActivityStats}
        >
          View Stats
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2.5}>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              select
              label="Activity Type"
              name="activityType"
              value={filters.activityType}
              onChange={handleFilterChange}
              fullWidth
            >
              <MenuItem value="">All Types</MenuItem>
              {activityTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              select
              label="Student"
              name="studentId"
              value={filters.studentId}
              onChange={handleFilterChange}
              fullWidth
            >
              <MenuItem value="">All Students</MenuItem>
              {students.map((student) => (
                <MenuItem key={student._id} value={student._id}>
                  {student.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<FilterIcon />}
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Activities Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Activity Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((activity) => (
                  <TableRow key={activity._id} hover>
                    <TableCell>{activity.student?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.activityType?.charAt(0).toUpperCase() + activity.activityType?.slice(1)} 
                        color={
                          activity.activityType === 'match' ? 'error' :
                          activity.activityType === 'training' ? 'primary' :
                          'default'
                        }
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>{formatDate(activity.startTime)}</TableCell>
                    <TableCell>{formatDuration(activity.duration)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.status?.charAt(0).toUpperCase() + activity.status?.slice(1)} 
                        color={
                          activity.status === 'completed' ? 'success' :
                          activity.status === 'in-progress' ? 'warning' :
                          activity.status === 'canceled' ? 'error' :
                          'default'
                        }
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleViewActivity(activity)}
                        sx={{ mr: 1 }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(activity)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {activities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No activities found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={activities.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* View Activity Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Activity Details</DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Title</Typography>
                <Typography variant="body1" gutterBottom>{selectedActivity.title}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Type</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.activityType?.charAt(0).toUpperCase() + selectedActivity.activityType?.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Student</Typography>
                <Typography variant="body1" gutterBottom>{selectedActivity.student?.name || 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Coach</Typography>
                <Typography variant="body1" gutterBottom>{selectedActivity.coach?.name || 'Not assigned'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Start Time</Typography>
                <Typography variant="body1" gutterBottom>{formatDate(selectedActivity.startTime)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">End Time</Typography>
                <Typography variant="body1" gutterBottom>{formatDate(selectedActivity.endTime)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Duration</Typography>
                <Typography variant="body1" gutterBottom>{formatDuration(selectedActivity.duration)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.status?.charAt(0).toUpperCase() + selectedActivity.status?.slice(1)}
                </Typography>
              </Grid>
              {selectedActivity.areaCovered && selectedActivity.areaCovered.value && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Area Covered</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedActivity.areaCovered.value} {selectedActivity.areaCovered.unit}
                  </Typography>
                </Grid>
              )}
              {selectedActivity.distance && selectedActivity.distance.value && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Distance</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedActivity.distance.value} {selectedActivity.distance.unit}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.description || 'No description provided'}
                </Typography>
              </Grid>
              {selectedActivity.performance && selectedActivity.performance.rating && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Performance Rating</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedActivity.performance.rating}/10
                  </Typography>
                </Grid>
              )}
              {selectedActivity.intensity && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Intensity</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedActivity.intensity}/10
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Activity Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this activity?
            {selectedActivity && ` "${selectedActivity.title}" for ${selectedActivity.student?.name || 'Unknown'}`}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Activity Statistics</DialogTitle>
        <DialogContent>
          {activityStats.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Activity Type</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Avg Duration</TableCell>
                    <TableCell>Total Duration</TableCell>
                    <TableCell>Avg Intensity</TableCell>
                    <TableCell>Avg Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityStats.map((stat) => (
                    <TableRow key={stat._id || 'unknown'}>
                      <TableCell>
                        {stat._id ? (stat._id.charAt(0).toUpperCase() + stat._id.slice(1)) : 'Unknown'}
                      </TableCell>
                      <TableCell>{stat.count}</TableCell>
                      <TableCell>{formatDuration(Math.round(stat.avgDuration))}</TableCell>
                      <TableCell>{formatDuration(stat.totalDuration)}</TableCell>
                      <TableCell>{stat.avgIntensity ? stat.avgIntensity.toFixed(1) : 'N/A'}</TableCell>
                      <TableCell>{stat.avgPerformanceRating ? stat.avgPerformanceRating.toFixed(1) : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No statistics available for the selected filters.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Activities;