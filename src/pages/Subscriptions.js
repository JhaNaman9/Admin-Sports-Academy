import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Check as CheckIcon,
  LocalOffer as OfferIcon
} from '@mui/icons-material';

const Subscriptions = () => {
  // Static subscription plans data
  const subscriptionPlans = [
    { 
      id: 1, 
      name: 'Basic', 
      price: '$50', 
      duration: '1 month',
      features: [
        'Access to basic facilities',
        'One sport selection',
        'Regular training sessions',
        'Basic equipment provided'
      ],
      isPopular: false,
      color: '#0288d1'
    },
    { 
      id: 2, 
      name: 'Standard', 
      price: '$120', 
      duration: '3 months',
      features: [
        'Access to all facilities',
        'Two sport selections',
        'Regular training sessions',
        'All equipment provided',
        'Monthly assessments'
      ],
      isPopular: true,
      color: '#2e7d32'
    },
    { 
      id: 3, 
      name: 'Premium', 
      price: '$200', 
      duration: '6 months',
      features: [
        'Access to all facilities',
        'All sports access',
        'Advanced training sessions',
        'Premium equipment provided',
        'Weekly assessments',
        'Personal coach assistance'
      ],
      isPopular: false,
      color: '#ed6c02'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Subscription Plans
      </Typography>
      
      <Grid container spacing={3}>
        {subscriptionPlans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                border: plan.isPopular ? `2px solid ${plan.color}` : 'none',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                }
              }}
            >
              {plan.isPopular && (
                <Chip 
                  label="Most Popular" 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    bgcolor: plan.color,
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
              )}
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <OfferIcon sx={{ color: plan.color, mr: 1, fontSize: 28 }} />
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {plan.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: plan.color }}>
                    {plan.price}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                    /{plan.duration}
                  </Typography>
                </Box>
                
                <List sx={{ mb: 3 }}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckIcon sx={{ color: plan.color }} />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
                
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ 
                    mt: 'auto', 
                    bgcolor: plan.color,
                    '&:hover': {
                      bgcolor: plan.color,
                      filter: 'brightness(90%)'
                    }
                  }}
                >
                  Edit Plan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Subscriptions; 