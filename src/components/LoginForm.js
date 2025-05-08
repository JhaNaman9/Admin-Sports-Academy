import React, { useState, useContext } from 'react';
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  InputAdornment,
  IconButton,
  Link,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { AuthContext } from '../App';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { setIsAuthenticated, setUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await authService.login({ email, password });
      
      // Check if user is admin (only admin role can access admin panel)
      const { user, accessToken, refreshToken } = response.data.data;
      
      if (user.role !== 'admin') {
        setError('You do not have permission to access the admin panel');
        setLoading(false);
        return;
      }
      
      // Store authentication data in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update auth context state directly
      setUser(user);
      setIsAuthenticated(true);
      
      // Redirect to dashboard with small delay to ensure state updates
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            component="img"
            src="/logo192.png" 
            alt="Logo"
            sx={{ 
              height: 60,
              width: 60,
              mb: 1
            }}
          />
        </Box>
        <Typography variant="h5" component="div" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          Sports Academy Admin Panel
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your credentials to access the administration panel
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
            }}
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            disabled={loading}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3 }}>
            <Link href="#" underline="hover" color="primary">
              Forgot password?
            </Link>
          </Box>
          
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large"
            sx={{ 
              py: 1.5,
              mt: 1,
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm; 