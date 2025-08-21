import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useStore } from '../../store/useStore';

const Header: React.FC = () => {
  const { queueSummary } = useStore();

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <HospitalIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Vaidy.AI
        </Typography>
        <Typography variant="subtitle2" sx={{ mr: 2, opacity: 0.8 }}>
          Clinical Triage System
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`CRITICAL: ${queueSummary.critical}`}
            size="small"
            color="error"
            variant="outlined"
          />
          <Chip
            label={`HIGH: ${queueSummary.high}`}
            size="small"
            color="warning"
            variant="outlined"
          />
          <Chip
            label={`MEDIUM: ${queueSummary.medium}`}
            size="small"
            color="info"
            variant="outlined"
          />
          <Chip
            label={`LOW: ${queueSummary.low}`}
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>

        <Box sx={{ ml: 2 }}>
          <IconButton color="inherit" size="large">
            <Badge badgeContent={queueSummary.critical + queueSummary.high} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" size="large">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
