import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import {
  Save as SaveIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  
  // General settings state
  const [academyName, setAcademyName] = useState('Sports Academy');
  const [contactEmail, setContactEmail] = useState('contact@sportsacademy.com');
  const [contactPhone, setContactPhone] = useState('(555) 123-4567');
  const [location, setLocation] = useState('123 Sports St, Athleticville, SV 12345');
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [newStudentAlerts, setNewStudentAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [tournamentReminders, setTournamentReminders] = useState(true);
  
  // Working hours state
  const [workingHours, setWorkingHours] = useState({
    monday: { open: '08:00', close: '20:00' },
    tuesday: { open: '08:00', close: '20:00' },
    wednesday: { open: '08:00', close: '20:00' },
    thursday: { open: '08:00', close: '20:00' },
    friday: { open: '08:00', close: '20:00' },
    saturday: { open: '09:00', close: '17:00' },
    sunday: { open: '10:00', close: '15:00' }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to a backend
    setShowSavedMessage(true);
  };

  const handleCloseSnackbar = () => {
    setShowSavedMessage(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Settings
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 500
            }
          }}
        >
          <Tab label="General" icon={<SchoolIcon />} iconPosition="start" />
          <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="Working Hours" icon={<ScheduleIcon />} iconPosition="start" />
        </Tabs>
        
        <CardContent>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Academy Name"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  InputProps={{
                    startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Communication Channels
                </Typography>
                <Box sx={{ ml: 2, mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={emailNotifications} 
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={smsNotifications} 
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="SMS Notifications"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Notification Types
                </Typography>
                <Box sx={{ ml: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={newStudentAlerts} 
                        onChange={(e) => setNewStudentAlerts(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="New Student Registrations"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={paymentAlerts} 
                        onChange={(e) => setPaymentAlerts(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Payment Receipts"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={tournamentReminders} 
                        onChange={(e) => setTournamentReminders(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Tournament Reminders"
                  />
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {Object.entries(workingHours).map(([day, hours]) => (
                <Grid item xs={12} sm={6} md={4} key={day}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 500, mb: 1 }}>
                      {day}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Open"
                        type="time"
                        value={hours.open}
                        onChange={(e) => setWorkingHours({
                          ...workingHours,
                          [day]: { ...hours, open: e.target.value }
                        })}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                      <TextField
                        label="Close"
                        type="time"
                        value={hours.close}
                        onChange={(e) => setWorkingHours({
                          ...workingHours,
                          [day]: { ...hours, close: e.target.value }
                        })}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Snackbar
        open={showSavedMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 