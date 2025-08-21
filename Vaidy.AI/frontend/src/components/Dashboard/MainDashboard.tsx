import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { queueApi } from '../../services/api';

const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { queueSummary, queueEntries, loading, setQueueEntries, setLoading } = useStore();

  useEffect(() => {
    loadQueueData();
  }, []);

  const loadQueueData = async () => {
    setLoading(true);
    try {
      const response = await queueApi.getQueue();
      if (response.data) {
        setQueueEntries(response.data);
      }
    } catch (error) {
      console.error('Failed to load queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageWaitTime = () => {
    if (queueEntries.length === 0) return 0;
    const totalWait = queueEntries.reduce((sum, entry) => sum + entry.waitMinutes, 0);
    return Math.round(totalWait / queueEntries.length);
  };

  const getCriticalPatients = () => {
    return queueEntries.filter(entry => entry.band === 'CRITICAL').length;
  };

  const getWaitingPatients = () => {
    return queueEntries.filter(entry => entry.status === 'waiting').length;
  };

  const getAssignedPatients = () => {
    return queueEntries.filter(entry => entry.status === 'assigned').length;
  };

  const getSystemHealth = () => {
    const criticalCount = getCriticalPatients();
    if (criticalCount > 5) return 'critical';
    if (criticalCount > 2) return 'warning';
    return 'healthy';
  };

  const getSystemHealthColor = () => {
    const health = getSystemHealth();
    switch (health) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'healthy': return 'success';
      default: return 'info';
    }
  };

  const getSystemHealthText = () => {
    const health = getSystemHealth();
    switch (health) {
      case 'critical': return 'High Critical Load';
      case 'warning': return 'Moderate Load';
      case 'healthy': return 'Normal Operations';
      default: return 'Unknown';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vaidy.AI Dashboard
      </Typography>

      {/* System Health Alert */}
      <Alert 
        severity={getSystemHealthColor()} 
        sx={{ mb: 3 }}
        icon={getSystemHealth() === 'critical' ? <WarningIcon /> : <CheckCircleIcon />}
      >
        System Status: {getSystemHealthText()}
      </Alert>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Patients</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {queueSummary.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In queue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Critical</Typography>
              </Box>
              <Typography variant="h3" color="error">
                {queueSummary.critical}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Require immediate attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Wait</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {getAverageWaitTime()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Assigned</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {getAssignedPatients()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To providers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<HospitalIcon />}
                    onClick={() => navigate('/intake')}
                    sx={{ mb: 1 }}
                  >
                    New Patient Intake
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AssignmentIcon />}
                    onClick={() => navigate('/queue')}
                    sx={{ mb: 1 }}
                  >
                    Manage Queue
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AnalyticsIcon />}
                    onClick={() => navigate('/analytics')}
                    sx={{ mb: 1 }}
                  >
                    View Analytics
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/providers')}
                    sx={{ mb: 1 }}
                  >
                    Manage Providers
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Queue Distribution
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Critical</Typography>
                  <Typography variant="body2">{queueSummary.critical}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(queueSummary.critical / queueSummary.total) * 100}
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">High</Typography>
                  <Typography variant="body2">{queueSummary.high}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(queueSummary.high / queueSummary.total) * 100}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Medium</Typography>
                  <Typography variant="body2">{queueSummary.medium}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(queueSummary.medium / queueSummary.total) * 100}
                  color="info"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Low</Typography>
                  <Typography variant="body2">{queueSummary.low}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(queueSummary.low / queueSummary.total) * 100}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {queueEntries.slice(0, 5).map((entry, index) => (
              <ListItem key={entry.encounterId}>
                <ListItemIcon>
                  <Chip
                    label={entry.band}
                    color={
                      entry.band === 'CRITICAL' ? 'error' :
                      entry.band === 'HIGH' ? 'warning' :
                      entry.band === 'MEDIUM' ? 'info' : 'success'
                    }
                    size="small"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`Encounter ${entry.encounterId.slice(0, 8)}...`}
                  secondary={`Priority: ${entry.priorityScore.toLocaleString()} | Wait: ${entry.waitMinutes} min | Status: ${entry.status}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MainDashboard;
