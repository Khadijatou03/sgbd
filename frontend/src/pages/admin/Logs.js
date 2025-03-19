import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const LogLevelChip = ({ level }) => {
  const getColor = () => {
    switch (level.toLowerCase()) {
      case 'info':
        return 'info';
      case 'warn':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getIcon = () => {
    switch (level.toLowerCase()) {
      case 'info':
        return <InfoIcon />;
      case 'warn':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={level}
      color={getColor()}
      size="small"
      variant="outlined"
    />
  );
};

const Logs = () => {
  const { showError } = useSnackbar();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    level: 'all',
    dateRange: 'all',
    source: 'all'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/logs', {
        params: {
          level: filters.level !== 'all' ? filters.level : undefined,
          dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
          source: filters.source !== 'all' ? filters.source : undefined
        }
      });
      setLogs(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  }, [filters, showError]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/logs/${selectedLog.id}`);
      setLogs(logs.filter(log => log.id !== selectedLog.id));
      setDeleteDialogOpen(false);
    } catch (error) {
      showError('Erreur lors de la suppression du log');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/admin/logs/export', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError('Erreur lors de l\'export des logs');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Logs système
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Exporter
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher dans les logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilterOpen(true)}
              >
                Filtres
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Niveau</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Message</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <LogLevelChip level={log.level} />
                    </TableCell>
                    <TableCell>{log.source}</TableCell>
                    <TableCell>{log.user || '-'}</TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={() => {
                            setSelectedLog(log);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce log ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog des filtres */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <DialogTitle>Filtres</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Niveau</InputLabel>
              <Select
                value={filters.level}
                label="Niveau"
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warn">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={filters.dateRange}
                label="Période"
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              >
                <MenuItem value="all">Tout</MenuItem>
                <MenuItem value="today">Aujourd'hui</MenuItem>
                <MenuItem value="week">Cette semaine</MenuItem>
                <MenuItem value="month">Ce mois</MenuItem>
                <MenuItem value="year">Cette année</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={filters.source}
                label="Source"
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              >
                <MenuItem value="all">Toutes</MenuItem>
                <MenuItem value="auth">Authentification</MenuItem>
                <MenuItem value="api">API</MenuItem>
                <MenuItem value="db">Base de données</MenuItem>
                <MenuItem value="system">Système</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Logs; 