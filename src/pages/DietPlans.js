import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Assignment as AssignIcon } from '@mui/icons-material';
import { dietPlanService, studentService, coachService } from '../services/api';

const DietPlans = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState('');

  // Fetch diet plans on component mount
  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        setLoading(true);
        const response = await dietPlanService.getAllDietPlans();
        setDietPlans(response.data.data.dietPlans);
      } catch (err) {
        console.error('Failed to fetch diet plans:', err);
        setError('Failed to load diet plans');
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlans();
  }, []);

  // Fetch students for assignment dialog
  const fetchStudents = async () => {
    try {
      const response = await studentService.getAllStudents();
      setStudents(response.data.data.students);
    } catch (err) {
      console.error('Failed to fetch students:', err);
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

  // Handle delete button click
  const handleDeleteClick = (plan) => {
    setSelectedPlan(plan);
    setOpenDeleteDialog(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      await dietPlanService.deleteDietPlan(selectedPlan._id);
      setDietPlans(dietPlans.filter(plan => plan._id !== selectedPlan._id));
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('Failed to delete diet plan:', err);
      setError('Failed to delete diet plan');
    }
  };

  // Handle assign button click
  const handleAssignClick = (plan) => {
    setSelectedPlan(plan);
    fetchStudents();
    setSelectedStudents(plan.assignedStudents?.map(student => student._id) || []);
    setOpenAssignDialog(true);
  };

  // Handle student selection change
  const handleStudentChange = (event) => {
    const { value } = event.target;
    setSelectedStudents(Array.isArray(value) ? value : [value]);
  };

  // Handle confirm assignment
  const handleConfirmAssign = async () => {
    try {
      await dietPlanService.assignDietPlan(selectedPlan._id, selectedStudents);
      // Refresh diet plans list
      const response = await dietPlanService.getAllDietPlans();
      setDietPlans(response.data.data.dietPlans);
      setOpenAssignDialog(false);
    } catch (err) {
      console.error('Failed to assign diet plan:', err);
      setError('Failed to assign diet plan to students');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Diet Plans Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          href="/diet-plans/new"
        >
          Add New Diet Plan
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Coach</TableCell>
                <TableCell>Calories</TableCell>
                <TableCell>Meals</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dietPlans
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((plan) => (
                  <TableRow key={plan._id} hover>
                    <TableCell>{plan.title}</TableCell>
                    <TableCell>{plan.coach?.name || 'Not assigned'}</TableCell>
                    <TableCell>{plan.caloriesPerDay || 'Not specified'} kcal</TableCell>
                    <TableCell>{plan.meals?.length || 0}</TableCell>
                    <TableCell>
                      {plan.assignedStudents && plan.assignedStudents.length > 0 ? (
                        <Chip 
                          label={`${plan.assignedStudents.length} students`} 
                          color="primary" 
                          size="small" 
                        />
                      ) : (
                        'Not assigned'
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        size="small" 
                        href={`/diet-plans/edit/${plan._id}`}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        size="small" 
                        onClick={() => handleAssignClick(plan)}
                        sx={{ mr: 1 }}
                      >
                        <AssignIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDeleteClick(plan)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {dietPlans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No diet plans found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={dietPlans.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the diet plan "{selectedPlan?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Assign Diet Plan to Students</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select students to assign the diet plan "{selectedPlan?.title}".
          </DialogContentText>
          <TextField
            select
            label="Students"
            SelectProps={{
              multiple: true,
              native: false,
              value: selectedStudents,
              onChange: handleStudentChange,
              renderValue: (selected) => {
                const selectedNames = students
                  .filter(student => selected.includes(student._id))
                  .map(student => student.name)
                  .join(', ');
                return selectedNames || 'No students selected';
              }
            }}
            fullWidth
            variant="outlined"
            margin="normal"
          >
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} ({student.email})
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAssign} 
            color="primary" 
            variant="contained"
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DietPlans; 