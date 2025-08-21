import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useStore } from '../../store/useStore';
import { queueApi, WebSocketService } from '../../services/api';
import { QueueEntry, Provider, RiskBand } from '../../types';

const QueueDashboard: React.FC = () => {
  const {
    queueEntries,
    providers,
    queueSummary,
    loading,
    error,
    setQueueEntries,
    setProviders,
    setLoading,
    setError,
    updateQueueEntry,
  } = useStore();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
    setupWebSocket();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queueResponse, providersResponse] = await Promise.all([
        queueApi.getQueue(),
        queueApi.getProviders(),
      ]);

      if (queueResponse.error) {
        setError(queueResponse.error);
      } else {
        setQueueEntries(queueResponse.data || []);
      }

      if (providersResponse.error) {
        setError(providersResponse.error);
      } else {
        setProviders(providersResponse.data || []);
      }
    } catch (err) {
      setError('Failed to load queue data');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const wsService = new WebSocketService('ws://localhost:8082', (data) => {
      if (data.type === 'queue.entry.created') {
        setQueueEntries([...queueEntries, data.entry]);
      } else if (data.type === 'queue.entry.updated') {
        updateQueueEntry(data.entry.encounterId, data.entry);
      }
    });
    wsService.connect();
  };

  const handleAssignProvider = async () => {
    if (!selectedEntry || !selectedProvider) return;

    setAssigning(true);
    try {
      const response = await queueApi.assignProvider(selectedEntry.encounterId, selectedProvider);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        updateQueueEntry(selectedEntry.encounterId, response.data);
        setAssignDialogOpen(false);
        setSelectedEntry(null);
        setSelectedProvider('');
      }
    } catch (err) {
      setError('Failed to assign provider');
    } finally {
      setAssigning(false);
    }
  };

  const getRiskColor = (band: RiskBand) => {
    switch (band) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <ScheduleIcon color="warning" />;
      case 'assigned': return <AssignmentIcon color="info" />;
      case 'in_room': return <CheckCircleIcon color="success" />;
      case 'complete': return <CheckCircleIcon color="disabled" />;
      default: return <ScheduleIcon />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const sortedEntries = [...queueEntries].sort((a, b) => {
    // Sort by priority score (descending), then by creation time (ascending)
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return a.createdAt - b.createdAt;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Queue Management Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Queue Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#ffebee' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                CRITICAL
              </Typography>
              <Typography variant="h4" color="error">
                {queueSummary.critical}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                HIGH
              </Typography>
              <Typography variant="h4" color="warning.main">
                {queueSummary.high}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                MEDIUM
              </Typography>
              <Typography variant="h4" color="info.main">
                {queueSummary.medium}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                LOW
              </Typography>
              <Typography variant="h4" color="success.main">
                {queueSummary.low}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Queue Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Queue ({queueSummary.total} patients)
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Encounter ID</TableCell>
                    <TableCell>Risk Band</TableCell>
                    <TableCell>Priority Score</TableCell>
                    <TableCell>Wait Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedEntries.map((entry) => (
                    <TableRow
                      key={entry.encounterId}
                      sx={{
                        backgroundColor: entry.band === 'CRITICAL' ? '#ffebee' :
                                        entry.band === 'HIGH' ? '#fff3e0' :
                                        entry.band === 'MEDIUM' ? '#e3f2fd' : '#e8f5e9'
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {entry.encounterId.slice(0, 12)}...
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.band}
                          color={getRiskColor(entry.band)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {entry.priorityScore.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.waitMinutes} min
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(entry.status)}
                          <Typography variant="body2">
                            {entry.status}
                            {entry.assignedProviderId && ` (${entry.assignedProviderId})`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatTime(entry.updatedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Assign Provider">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedEntry(entry);
                                setAssignDialogOpen(true);
                              }}
                              disabled={entry.status !== 'waiting'}
                            >
                              <AssignmentIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Provider Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Provider</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Assign a provider to encounter: {selectedEntry?.encounterId}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Provider</InputLabel>
            <Select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              label="Select Provider"
            >
              {providers
                .filter(p => p.status === 'available')
                .map((provider) => (
                  <MenuItem key={provider.provider_id} value={provider.provider_id}>
                    {provider.name} ({provider.specialty})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignProvider}
            variant="contained"
            disabled={!selectedProvider || assigning}
          >
            {assigning ? <CircularProgress size={20} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QueueDashboard;
