import React from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {
  Box,
  Typography,
  Paper,
  Grid,
  ListItemIcon
} from '@mui/material';

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center">
              <ListItemIcon>
                <AssignmentIcon color="primary" />
              </ListItemIcon>
              <Typography variant="h6">
                Exercices
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 