import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';
import ErrorIcon from '@mui/icons-material/Error';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  useTheme,
  Alert
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalExercises: 0,
    completedExercises: 0,
    pendingSubmissions: 0,
    averageGrade: 0,
  });
  const [recentExercises, setRecentExercises] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [gradeEvolution, setGradeEvolution] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Récupérer les sujets
      const subjectsResponse = await axios.get('/api/subjects', { headers });
      const subjects = subjectsResponse.data;

      // Récupérer les soumissions selon le rôle
      let submissions = [];
      if (user.role === 'professor') {
        const submissionsResponse = await axios.get('/api/submissions/professor', { headers });
        submissions = submissionsResponse.data;
      } else if (user.role === 'student') {
        const submissionsResponse = await axios.get('/api/submissions/student', { headers });
        submissions = submissionsResponse.data;
      }

      // Calculer les statistiques
      const stats = {
        totalSubjects: subjects.length,
        totalSubmissions: submissions.length,
        pendingSubmissions: submissions.filter(s => !s.grade).length,
        averageGrade: submissions.reduce((acc, s) => acc + (s.grade || 0), 0) / submissions.length || 0
      };

      setStats(stats);
      setRecentExercises(subjects.slice(0, 5));
      setRecentSubmissions(submissions.slice(0, 5));

    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur lors de la récupération des sujets:', err);
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const renderStudentDashboard = () => (
    <Grid container spacing={3}>
      {/* Statistiques */}
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Exercices totaux
          </Typography>
          <Typography variant="h4">{stats.totalExercises}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Exercices complétés
          </Typography>
          <Typography variant="h4">{stats.completedExercises}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Soumissions en attente
          </Typography>
          <Typography variant="h4">{stats.pendingSubmissions}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Note moyenne
          </Typography>
          <Typography variant="h4">{stats.averageGrade.toFixed(1)}</Typography>
        </Paper>
      </Grid>

      {/* Évolution des notes */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Évolution de vos notes
            </Typography>
            {gradeEvolution && (
              <Line
                data={{
                  labels: gradeEvolution.map(item => new Date(item.date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Note moyenne',
                      data: gradeEvolution.map(item => item.average_grade),
                      borderColor: theme.palette.primary.main,
                      tension: 0.1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 20
                    }
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Exercices récents */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Exercices récents</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/exercises')}
            >
              Voir tout
            </Button>
          </Box>
          <List>
            {recentExercises.map((exercise) => (
              <ListItem
                key={exercise.id}
                button
                onClick={() => navigate(`/exercises/${exercise.id}`)}
              >
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary={exercise.title}
                  secondary={`Date limite: ${new Date(exercise.deadline).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Soumissions récentes */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Soumissions récentes</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/submissions')}
            >
              Voir tout
            </Button>
          </Box>
          <List>
            {recentSubmissions.map((submission) => (
              <ListItem key={submission.id}>
                <ListItemIcon>
                  {submission.status === 'completed' ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={submission.exerciseTitle}
                  secondary={`Soumis le ${new Date(submission.submittedAt).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderTeacherDashboard = () => (
    <Grid container spacing={3}>
      {/* Statistiques */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Statistiques globales
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <GroupIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Étudiants actifs"
                  secondary={stats?.total_students || 0}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Exercices créés"
                  secondary={stats?.total_exercises || 0}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssessmentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Note moyenne"
                  secondary={`${stats?.average_grade?.toFixed(2) || 0}/20`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Graphique des notes */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribution des notes
            </Typography>
            {stats?.gradeDistribution && (
              <Line
                data={{
                  labels: stats.gradeDistribution.map(item => item.grade_range),
                  datasets: [
                    {
                      label: 'Nombre d\'étudiants',
                      data: stats.gradeDistribution.map(item => item.count),
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.primary.light
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Exercices à corriger */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Exercices à corriger
            </Typography>
            <List>
              {recentSubmissions
                .filter(submission => submission.status === 'pending')
                .map((submission) => (
                  <React.Fragment key={submission.id}>
                    <ListItem button onClick={() => navigate(`/submissions/${submission.id}`)}>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={submission.exercise_title}
                        secondary={`${submission.student_name} - ${new Date(submission.created_at).toLocaleDateString()}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
            </List>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="primary"
              onClick={() => navigate('/submissions')}
            >
              Voir toutes les soumissions
            </Button>
          </CardActions>
        </Card>
      </Grid>

      {/* Exercices créés */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vos exercices récents
            </Typography>
            <List>
              {recentExercises
                .filter(exercise => exercise.teacher_id === user.id)
                .map((exercise) => (
                  <React.Fragment key={exercise.id}>
                    <ListItem button onClick={() => navigate(`/exercises/${exercise.id}`)}>
                      <ListItemIcon>
                        <AssignmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={exercise.title}
                        secondary={`${exercise.submission_count} soumissions`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
            </List>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="primary"
              onClick={() => navigate('/exercises/new')}
            >
              Créer un exercice
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAdminDashboard = () => (
    <Grid container spacing={3}>
      {/* Statistiques globales */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Statistiques globales
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <GroupIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Utilisateurs"
                  secondary={`${stats?.total_students || 0} étudiants, ${stats?.total_teachers || 0} enseignants`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Exercices"
                  secondary={stats?.total_exercises || 0}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <UploadIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Soumissions"
                  secondary={stats?.total_submissions || 0}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Plagiat détecté"
                  secondary={stats?.plagiarism_count || 0}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Graphique d'activité */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Activité récente
            </Typography>
            {stats?.dailyStats && (
              <Line
                data={{
                  labels: stats.dailyStats.map(item => new Date(item.date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Soumissions',
                      data: stats.dailyStats.map(item => item.count),
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.primary.light
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Actions rapides */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Actions rapides
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<GroupIcon />}
                  onClick={() => navigate('/admin/users')}
                >
                  Gérer les utilisateurs
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<BarChartIcon />}
                  onClick={() => navigate('/admin/logs')}
                >
                  Voir les logs
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate('/admin/statistics')}
                >
                  Statistiques détaillées
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/admin/performance')}
                >
                  Performance
                </Button>
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

  if (error) {
    return (
      <Box m={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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

        {user.role === 'student' && renderStudentDashboard()}
        {user.role === 'teacher' && renderTeacherDashboard()}
        {user.role === 'admin' && renderAdminDashboard()}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Exemple d'exercice"
                    secondary="Description de l'exercice"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 