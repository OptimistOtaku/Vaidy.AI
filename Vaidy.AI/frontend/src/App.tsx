import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainDashboard from './components/Dashboard/MainDashboard';
import IntakeForm from './components/Intake/IntakeForm';
import QueueDashboard from './components/Queue/QueueDashboard';

const DRAWER_WIDTH = 240;

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          mt: '64px', // Header height
        }}
      >
        <Routes>
          <Route path="/" element={<MainDashboard />} />
          <Route path="/intake" element={<IntakeForm />} />
          <Route path="/queue" element={<QueueDashboard />} />
          <Route path="/risk" element={<div>Risk Assessment (Coming Soon)</div>} />
          <Route path="/providers" element={<div>Provider Management (Coming Soon)</div>} />
          <Route path="/analytics" element={<div>Analytics (Coming Soon)</div>} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
