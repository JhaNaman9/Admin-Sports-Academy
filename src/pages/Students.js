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
  Chip,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';
import { studentService, authService } from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sportCategories, setSportCategories] = useState([]);
  
  // Fetch students and sport categories on component mount
  useEffect(() => {
    // Fetch students
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Use the service instead of direct axios call
        console.log('Fetching students from admin panel...');
        const response = await studentService.getAllStudents();
        
        console.log('Students data received:', response.data);
        if (response.data && response.data.data && Array.isArray(response.data.data.students)) {
          setStudents(response.data.data.students);
          console.log('Students set to:', response.data.data.students);
        } else {
          console.error('Unexpected API response structure:', response.data);
          setError('Unexpected API response structure');
          setStudents([]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        
        // Check for auth errors
        if (err.response && err.response.status === 401) {
          setError('Authentication error. Please log in again.');
          // Redirect to login page
          setTimeout(() => {
            authService.logout();
            window.location.href = '/login';
          }, 2000);
        } else if (err.response) {
          console.error('Error response:', err.response.data);
          setError(err.response.data?.message || `Failed to load students (${err.response.status})`);
        } else if (err.request) {
          console.error('No response received');
          setError('No response from server. Please check your connection.');
        } else {
          console.error('Error message:', err.message);
          setError(`Error: ${err.message}`);
        }
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch sport categories
    const fetchSportCategories = async () => {
      try {
        const response = await axios.get('/api/v1/sport-categories');
        setSportCategories(response.data.data.sportCategories || []);
      } catch (err) {
        console.error('Error fetching sport categories:', err);
      }
    };
    
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      fetchStudents();
      fetchSportCategories();
    } else {
      setError('You are not logged in. Please login first.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }, []);
  
  // Handle view student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Manage Students
        </Typography>
        <Button 
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* Add student logic */}}
        >
          Add Student
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Sports</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No students found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow 
                    key={student._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {student._id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ mr: 2, bgcolor: '#0288d1' }}
                          src={student.user?.profileImage}
                        >
                          {student.user?.name?.charAt(0) || 'S'}
                        </Avatar>
                        {student.user?.name || 'Unknown'}
                      </Box>
                    </TableCell>
                    <TableCell>{student.user?.email || 'No email'}</TableCell>
                    <TableCell>
                      {student.sportPreferences && student.sportPreferences.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {student.sportPreferences.map(sport => (
                            <Chip 
                              key={typeof sport === 'object' ? sport._id : sport}
                              label={typeof sport === 'object' ? sport.name : 'Sport'}
                              size="small"
                              sx={{ backgroundColor: '#0288d170', color: '#000' }}
                            />
                          ))}
                        </Box>
                      ) : 'None'}
                    </TableCell>
                    <TableCell>{student.age || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={student.user?.approved ? 'Active' : 'Pending'} 
                        size="small"
                        sx={{ 
                          backgroundColor: student.user?.approved ? '#2e7d3270' : '#ed6c0270',
                          color: student.user?.approved ? '#1b5e20' : '#e65100'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" size="small" onClick={() => handleViewStudent(student)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="primary" size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Student Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedStudent(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Student Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedStudent && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ width: 80, height: 80, mr: 3, bgcolor: '#0288d1' }}
                  src={selectedStudent.user?.profileImage}
                >
                  {selectedStudent.user?.name?.charAt(0) || 'S'}
                </Avatar>
                <Box>
                  <Typography variant="h5">{selectedStudent.user?.name}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedStudent.user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudent.user?.phone || 'No phone number'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ my: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Sports Preferences
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {selectedStudent.sportPreferences && selectedStudent.sportPreferences.length > 0 ? 
                    selectedStudent.sportPreferences.map(sport => (
                      <Chip 
                        key={typeof sport === 'object' ? sport._id : sport}
                        label={typeof sport === 'object' ? sport.name : 'Sport'}
                        sx={{ backgroundColor: '#0288d170', color: '#000' }}
                      />
                    )) : 
                    <Typography variant="body2" color="text.secondary">No sports preferences</Typography>
                  }
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant="subtitle1" gutterBottom>Age</Typography>
                  <Typography variant="body1">{selectedStudent.age || 'Not specified'}</Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant="subtitle1" gutterBottom>Gender</Typography>
                  <Typography variant="body1">{selectedStudent.gender || 'Not specified'}</Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant="subtitle1" gutterBottom>Registration Date</Typography>
                  <Typography variant="body1">
                    {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant="subtitle1" gutterBottom>Status</Typography>
                  <Chip 
                    label={selectedStudent.user?.approved ? 'Active' : 'Pending'} 
                    sx={{ 
                      backgroundColor: selectedStudent.user?.approved ? '#2e7d3270' : '#ed6c0270',
                      color: selectedStudent.user?.approved ? '#1b5e20' : '#e65100'
                    }}
                  />
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setSelectedStudent(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students; 