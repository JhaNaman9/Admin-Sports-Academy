import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  IconButton,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

const Announcements = () => {
  // Static announcements data
  const announcements = [
    { 
      id: 1, 
      title: 'New Session Registration', 
      content: 'Registration for the summer session starts on June 1. Early bird discounts available until May 15.',
      date: '2025-05-10',
      author: 'Admin',
      category: 'Registration',
      important: true
    },
    { 
      id: 2, 
      title: 'Facility Maintenance', 
      content: 'The swimming pool will be closed for maintenance from April 5 to April 10. We apologize for any inconvenience.',
      date: '2025-04-01',
      author: 'Facilities Manager',
      category: 'Maintenance',
      important: false
    },
    { 
      id: 3, 
      title: 'New Coach Introduction', 
      content: 'Please welcome our new tennis coach, Sarah Williams. She will be taking over all advanced tennis classes starting next month.',
      date: '2025-03-20',
      author: 'HR Department',
      category: 'Staff',
      important: false
    },
    { 
      id: 4, 
      title: 'Holiday Schedule', 
      content: 'The academy will be closed during national holidays. Please check the calendar for specific dates.',
      date: '2025-03-15',
      author: 'Admin',
      category: 'Schedule',
      important: true
    },
    { 
      id: 5, 
      title: 'Tournament Results', 
      content: 'Congratulations to all participants in our Winter Championship. Results and photos are now available on our website.',
      date: '2025-02-10',
      author: 'Events Coordinator',
      category: 'Events',
      important: false
    },
  ];

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Registration':
        return '#0288d1';
      case 'Maintenance':
        return '#ed6c02';
      case 'Staff':
        return '#9c27b0';
      case 'Schedule':
        return '#2e7d32';
      case 'Events':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Announcements
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ 
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' }
          }}
        >
          Add Announcement
        </Button>
      </Box>
      
      <Stack spacing={3}>
        {announcements.map((announcement) => (
          <Card 
            key={announcement.id}
            sx={{ 
              position: 'relative',
              borderLeft: announcement.important ? '4px solid #d32f2f' : 'none',
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              }
            }}
          >
            {announcement.important && (
              <Chip 
                label="Important" 
                size="small"
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: '#d32f2f20',
                  color: '#d32f2f',
                  fontWeight: 500
                }}
              />
            )}
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, pr: announcement.important ? 5 : 0 }}>
                {announcement.title}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3 }}>
                {announcement.content}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(announcement.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {announcement.author}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Chip 
                    label={announcement.category} 
                    size="small"
                    sx={{ 
                      bgcolor: `${getCategoryColor(announcement.category)}20`,
                      color: getCategoryColor(announcement.category),
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton color="primary" size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton color="error" size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Announcements; 