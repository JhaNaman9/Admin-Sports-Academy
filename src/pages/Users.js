import React from 'react';
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
  IconButton
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const Users = () => {
  // Static users data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Coach', status: 'Active' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'Student', status: 'Inactive' },
    { id: 4, name: 'Emily Wilson', email: 'emily@example.com', role: 'Student', status: 'Active' },
    { id: 5, name: 'Michael Brown', email: 'michael@example.com', role: 'Admin', status: 'Active' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Manage Users
      </Typography>
      
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {user.id}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: user.role === 'Admin' 
                          ? '#9c27b0' 
                          : user.role === 'Coach'
                            ? '#ed6c02'
                            : '#0288d1'
                      }}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                    {user.name}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    size="small"
                    sx={{ 
                      backgroundColor: user.role === 'Admin' 
                        ? '#9c27b070' 
                        : user.role === 'Coach'
                          ? '#ed6c0270'
                          : '#0288d170',
                      color: '#000'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    size="small"
                    sx={{ 
                      backgroundColor: user.status === 'Active' ? '#2e7d3270' : '#c6292670',
                      color: user.status === 'Active' ? '#1b5e20' : '#7f0000'
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Users; 