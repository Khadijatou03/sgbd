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
  Button,
  Divider,
  Alert,
  Stack,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  VpnKey as VpnKeyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const Licenses = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [licenseInfo, setLicenseInfo] = useState({
    currentLicense: {
      key: '',
      type: '',
      status: '',
      expiryDate: null,
      features: [],
      maxUsers: 0,
      usedUsers: 0
    },
    availableFeatures: [],
    subscriptionPlans: [],
    usageHistory: [],
    billingInfo: {
      plan: '',
      status: '',
      nextBillingDate: null,
      paymentMethod: '',
      billingEmail: ''
    }
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });
  const [licenseDialog, setLicenseDialog] = useState({
    open: false,
    mode: 'add', // 'add' or 'edit'
    licenseKey: ''
  });

  useEffect(() => {
    fetchLicenseInfo();
  }, []);

  const fetchLicenseInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/system/licenses/info');
      setLicenseInfo(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des informations de licence');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLicense = () => {
    setLicenseDialog({
      open: true,
      mode: 'add',
      licenseKey: ''
    });
  };

  const handleEditLicense = () => {
    setLicenseDialog({
      open: true,
      mode: 'edit',
      licenseKey: licenseInfo.currentLicense.key
    });
  };

  const handleDeleteLicense = () => {
    setConfirmDialog({
      open: true,
      title: 'Supprimer la licence',
      message: 'Êtes-vous sûr de vouloir supprimer cette licence ? Cette action ne peut pas être annulée.',
      action: async () => {
        try {
          await axios.delete('/api/system/licenses/current');
          showSuccess('Licence supprimée avec succès');
          fetchLicenseInfo();
        } catch (error) {
          showError('Erreur lors de la suppression de la licence');
        }
      }
    });
  };

  const handleUpdateLicense = async () => {
    try {
      await axios.put('/api/system/licenses/current', {
        key: licenseDialog.licenseKey
      });
      showSuccess('Licence mise à jour avec succès');
      setLicenseDialog(prev => ({ ...prev, open: false }));
      fetchLicenseInfo();
    } catch (error) {
      showError('Erreur lors de la mise à jour de la licence');
    }
  };

  const handleActivateLicense = async () => {
    try {
      await axios.post('/api/system/licenses/activate', {
        key: licenseDialog.licenseKey
      });
      showSuccess('Licence activée avec succès');
      setLicenseDialog(prev => ({ ...prev, open: false }));
      fetchLicenseInfo();
    } catch (error) {
      showError('Erreur lors de l\'activation de la licence');
    }
  };

  const getLicenseStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getLicenseStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon color="success" />;
      case 'expired':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon />;
    }
  };

  const getFeatureIcon = (feature) => {
    switch (feature.type) {
      case 'security':
        return <SecurityIcon color="error" />;
      case 'business':
        return <BusinessIcon color="primary" />;
      case 'education':
        return <SchoolIcon color="info" />;
      default:
        return <StarIcon color="warning" />;
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
          Licences et abonnements
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddLicense}
        >
          Ajouter une licence
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Licence actuelle */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Licence actuelle"
              avatar={<VpnKeyIcon />}
              action={
                <Box>
                  <Tooltip title="Modifier">
                    <IconButton onClick={handleEditLicense}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton onClick={handleDeleteLicense}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type de licence
                  </Typography>
                  <Typography variant="h6">
                    {licenseInfo.currentLicense.type}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip
                    icon={getLicenseStatusIcon(licenseInfo.currentLicense.status)}
                    label={licenseInfo.currentLicense.status}
                    color={getLicenseStatusColor(licenseInfo.currentLicense.status)}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date d'expiration
                  </Typography>
                  <Typography>
                    {licenseInfo.currentLicense.expiryDate ? new Date(licenseInfo.currentLicense.expiryDate).toLocaleDateString() : 'Illimitée'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Utilisateurs
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(licenseInfo.currentLicense.usedUsers / licenseInfo.currentLicense.maxUsers) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {licenseInfo.currentLicense.usedUsers} / {licenseInfo.currentLicense.maxUsers}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Fonctionnalités disponibles */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Fonctionnalités disponibles"
              avatar={<StarIcon />}
            />
            <CardContent>
              <List>
                {licenseInfo.availableFeatures.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {getFeatureIcon(feature)}
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.name}
                      secondary={feature.description}
                    />
                    <Chip
                      label={feature.enabled ? 'Activé' : 'Désactivé'}
                      color={feature.enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Plans d'abonnement */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Plans d'abonnement"
              avatar={<BusinessIcon />}
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan</TableCell>
                      <TableCell>Prix</TableCell>
                      <TableCell>Période</TableCell>
                      <TableCell>Fonctionnalités</TableCell>
                      <TableCell>Utilisateurs max</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {licenseInfo.subscriptionPlans.map((plan, index) => (
                      <TableRow key={index}>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>{plan.price}€</TableCell>
                        <TableCell>{plan.period}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {plan.features.map((feature, idx) => (
                              <Tooltip key={idx} title={feature}>
                                <Chip
                                  label={feature}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Tooltip>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>{plan.maxUsers}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              // Logique pour changer de plan
                            }}
                          >
                            Choisir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Informations de facturation */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Informations de facturation"
              avatar={<BusinessIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Plan actuel
                  </Typography>
                  <Typography>
                    {licenseInfo.billingInfo.plan}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Statut
                  </Typography>
                  <Chip
                    label={licenseInfo.billingInfo.status}
                    color={licenseInfo.billingInfo.status === 'active' ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prochaine facturation
                  </Typography>
                  <Typography>
                    {licenseInfo.billingInfo.nextBillingDate ? new Date(licenseInfo.billingInfo.nextBillingDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Méthode de paiement
                  </Typography>
                  <Typography>
                    {licenseInfo.billingInfo.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email de facturation
                  </Typography>
                  <Typography>
                    {licenseInfo.billingInfo.billingEmail}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogue de licence */}
      <Dialog
        open={licenseDialog.open}
        onClose={() => setLicenseDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle>
          {licenseDialog.mode === 'add' ? 'Ajouter une licence' : 'Modifier la licence'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Clé de licence"
            fullWidth
            value={licenseDialog.licenseKey}
            onChange={(e) => setLicenseDialog(prev => ({ ...prev, licenseKey: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLicenseDialog(prev => ({ ...prev, open: false }))}>
            Annuler
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={licenseDialog.mode === 'add' ? handleActivateLicense : handleUpdateLicense}
          >
            {licenseDialog.mode === 'add' ? 'Activer' : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
            Annuler
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              confirmDialog.action();
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Licenses; 