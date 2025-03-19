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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const Logs = () => {
  const { user } = useAuth();
  const { showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    level: 'all',
    type: 'all',
    date: 'all'
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/logs', {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          ...filters
        }
      });
      setLogs(response.data.logs);
      setFilteredLogs(response.data.logs);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
    } catch (error) {
      showError('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = logs.filter(log =>
      log.message.toLowerCase().includes(term) ||
      log.user?.toLowerCase().includes(term) ||
      log.ip?.toLowerCase().includes(term)
    );
    setFilteredLogs(filtered);
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setLogDialogOpen(true);
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get('/api/logs/download', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `logs-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError('Erreur lors du téléchargement des logs');
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'error';
      case 'warn':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <ErrorIcon />;
      case 'warn':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return null;
    }
  };

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
          Logs système
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Télécharger
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Niveau</InputLabel>
                <Select
                  value={filters.level}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                  label="Niveau"
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="error">Erreur</MenuItem>
                  <MenuItem value="warn">Avertissement</MenuItem>
                  <MenuItem value="info">Information</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  label="Type"
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="auth">Authentification</MenuItem>
                  <MenuItem value="submission">Soumission</MenuItem>
                  <MenuItem value="system">Système</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getLevelIcon(log.level)}
                        label={log.level}
                        color={getLevelColor(log.level)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.type}</TableCell>
                    <TableCell>{log.user || '-'}</TableCell>
                    <TableCell>{log.ip || '-'}</TableCell>
                    <TableCell>
                      {log.message.substring(0, 100)}
                      {log.message.length > 100 && '...'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Voir les détails">
                        <IconButton onClick={() => handleLogClick(log)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </CardActions>
      </Card>

      {/* Dialogue de détails du log */}
      <Dialog
        open={logDialogOpen}
        onClose={() => setLogDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails du log</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Date et heure
                </Typography>
                <Typography>
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Niveau
                </Typography>
                <Chip
                  icon={getLevelIcon(selectedLog.level)}
                  label={selectedLog.level}
                  color={getLevelColor(selectedLog.level)}
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Type
                </Typography>
                <Typography>
                  {selectedLog.type}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Utilisateur
                </Typography>
                <Typography>
                  {selectedLog.user || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Adresse IP
                </Typography>
                <Typography>
                  {selectedLog.ip || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Message
                </Typography>
                <Typography>
                  {selectedLog.message}
                </Typography>
              </Box>
              {selectedLog.metadata && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Métadonnées
                  </Typography>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Logs; 