import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const Performance = () => {
  const { showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState({
    cpu: {
      current: 0,
      history: []
    },
    memory: {
      current: 0,
      history: []
    },
    disk: {
      current: 0,
      history: []
    },
    network: {
      current: 0,
      history: []
    }
  });

  const fetchPerformance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/performance');
      setPerformance(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des données de performance');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPerformance();
    const interval = setInterval(fetchPerformance, 30000); // Rafraîchir toutes les 30 secondes
    return () => clearInterval(interval);
  }, [fetchPerformance]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Performance système
      </Typography>

      <Grid container spacing={3}>
        {/* CPU */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Utilisation CPU
              </Typography>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={performance.cpu.current}
                  color={performance.cpu.current > 80 ? 'error' : 'primary'}
                />
                <Typography variant="body2" color="text.secondary" align="right">
                  {performance.cpu.current}%
                </Typography>
              </Box>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performance.cpu.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      name="CPU"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mémoire */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Utilisation mémoire
              </Typography>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={performance.memory.current}
                  color={performance.memory.current > 80 ? 'error' : 'primary'}
                />
                <Typography variant="body2" color="text.secondary" align="right">
                  {performance.memory.current}%
                </Typography>
              </Box>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performance.memory.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#82ca9d"
                      name="Mémoire"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Disque */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Utilisation disque
              </Typography>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={performance.disk.current}
                  color={performance.disk.current > 80 ? 'error' : 'primary'}
                />
                <Typography variant="body2" color="text.secondary" align="right">
                  {performance.disk.current}%
                </Typography>
              </Box>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performance.disk.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ffc658"
                      name="Disque"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Réseau */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trafic réseau
              </Typography>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={performance.network.current}
                  color={performance.network.current > 80 ? 'error' : 'primary'}
                />
                <Typography variant="body2" color="text.secondary" align="right">
                  {performance.network.current} MB/s
                </Typography>
              </Box>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performance.network.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ff7300"
                      name="Réseau"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Performance; 