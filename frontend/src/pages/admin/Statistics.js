import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Container
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Statistics = () => {
  const { showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({
    users: {
      total: 0,
      teachers: 0,
      students: 0,
      active: 0,
      inactive: 0
    },
    exercises: {
      total: 0,
      active: 0,
      archived: 0,
      byDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0
      }
    },
    submissions: {
      total: 0,
      pending: 0,
      graded: 0,
      rejected: 0,
      averageGrade: 0
    },
    activity: {
      daily: [],
      weekly: [],
      monthly: []
    }
  });

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get(`/api/admin/statistics?timeRange=${timeRange}`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      showError('Erreur lors du chargement des statistiques');
      setLoading(false);
    }
  }, [timeRange, showError]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            mr: 2
          }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Statistiques
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Soumissions par jour
            </Typography>
            <LineChart
              width={500}
              height={300}
              data={stats.activity[timeRange]}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Exercices par catégorie
            </Typography>
            <BarChart
              width={500}
              height={300}
              data={[
                { name: 'Facile', value: stats.exercises.byDifficulty.easy },
                { name: 'Moyen', value: stats.exercises.byDifficulty.medium },
                { name: 'Difficile', value: stats.exercises.byDifficulty.hard }
              ]}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Taux de réussite global
            </Typography>
            <PieChart width={500} height={300}>
              <Pie
                data={[
                  { name: 'Réussi', value: stats.submissions.graded },
                  { name: 'Échoué', value: stats.submissions.rejected }
                ]}
                cx={250}
                cy={150}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {[
                  { name: 'Réussi', value: stats.submissions.graded },
                  { name: 'Échoué', value: stats.submissions.rejected }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Statistics; 