import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Statistics = () => {
  const { user } = useAuth();
  const { showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({
    submissions: [],
    grades: [],
    exercises: [],
    users: [],
    plagiarism: []
  });

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/statistics', {
        params: { timeRange }
      });
      setStats(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const renderStudentStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Progression des notes" />
          <CardContent>
            <LineChart
              width={500}
              height={300}
              data={stats.grades}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 20]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="grade"
                stroke="#8884d8"
                name="Note"
              />
            </LineChart>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Statistiques globales" />
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre total de soumissions
                </Typography>
                <Typography variant="h4">
                  {stats.submissions.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Moyenne des notes
                </Typography>
                <Typography variant="h4">
                  {(stats.grades.reduce((acc, curr) => acc + curr.grade, 0) / stats.grades.length).toFixed(1)}/20
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Exercices réussis
                </Typography>
                <Typography variant="h4">
                  {stats.submissions.filter(s => s.status === 'graded' && s.grade >= 10).length}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTeacherStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Distribution des notes" />
          <CardContent>
            <BarChart
              width={500}
              height={300}
              data={stats.grades}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Nombre d'étudiants" />
            </BarChart>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Statistiques des exercices" />
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Taux de réussite moyen
                </Typography>
                <Typography variant="h4">
                  {((stats.submissions.filter(s => s.status === 'graded' && s.grade >= 10).length / stats.submissions.length) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Exercices à corriger
                </Typography>
                <Typography variant="h4">
                  {stats.submissions.filter(s => s.status === 'pending').length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Plagiat détecté
                </Typography>
                <Typography variant="h4" color="error">
                  {stats.plagiarism.length}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAdminStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Répartition des utilisateurs" />
          <CardContent>
            <PieChart width={500} height={300}>
              <Pie
                data={stats.users}
                dataKey="count"
                nameKey="role"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats.users.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Activité récente" />
          <CardContent>
            <LineChart
              width={500}
              height={300}
              data={stats.submissions}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                name="Soumissions"
              />
            </LineChart>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title="Statistiques globales" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total utilisateurs
                  </Typography>
                  <Typography variant="h4">
                    {stats.users.reduce((acc, curr) => acc + curr.count, 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total exercices
                  </Typography>
                  <Typography variant="h4">
                    {stats.exercises.length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total soumissions
                  </Typography>
                  <Typography variant="h4">
                    {stats.submissions.length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Plagiat détecté
                  </Typography>
                  <Typography variant="h4" color="error">
                    {stats.plagiarism.length}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Statistiques
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Période"
          >
            <MenuItem value="day">Aujourd'hui</MenuItem>
            <MenuItem value="week">Cette semaine</MenuItem>
            <MenuItem value="month">Ce mois</MenuItem>
            <MenuItem value="year">Cette année</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {user.role === 'student' && renderStudentStats()}
      {user.role === 'teacher' && renderTeacherStats()}
      {user.role === 'admin' && renderAdminStats()}
    </Box>
  );
};

export default Statistics; 