import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  MonitorHeart as VitalsIcon,
} from '@mui/icons-material';
import { IntakeData, Vitals } from '../../types';
import { intakeApi } from '../../services/api';

const IntakeForm: React.FC = () => {
  const [formData, setFormData] = useState<IntakeData>({
    patient: {
      mrn: 'A12345',
      dob: '1957-04-03',
    },
    narrative: 'Crushing chest pain radiating to left arm, started 30 minutes ago.',
    painScore: 9,
    vitals: {
      hr: 105,
      bp: '180/110',
      rr: 24,
      spo2: 96,
      tempC: 37.0,
    },
    language: 'en',
    specialNeeds: [],
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof IntakeData];
        return {
          ...prev,
          [parent]: {
            ...(parentValue && typeof parentValue === 'object' ? parentValue : {}),
            [child]: value,
          },
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleVitalsChange = (field: keyof Vitals, value: any) => {
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await intakeApi.submitIntake(formData);
      if (response.error) {
        setError(response.error);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      setError('Failed to submit intake. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (band: string) => {
    switch (band) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Patient Intake
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Patient Information"
              avatar={<PersonIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Medical Record Number (MRN)"
                    value={formData.patient?.mrn || ''}
                    onChange={(e) => handleInputChange('patient.mrn', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={formData.patient?.dob || ''}
                    onChange={(e) => handleInputChange('patient.dob', e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardHeader
              title="Clinical Narrative"
              avatar={<HospitalIcon />}
            />
            <CardContent>
              <TextField
                fullWidth
                label="Patient's Chief Complaint & History"
                multiline
                rows={4}
                value={formData.narrative}
                onChange={(e) => handleInputChange('narrative', e.target.value)}
                margin="normal"
                placeholder="Describe the patient's symptoms, onset, and relevant history..."
              />
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardHeader
              title="Pain Assessment"
              avatar={<HospitalIcon />}
            />
            <CardContent>
              <Typography gutterBottom>
                Pain Score: {formData.painScore}/10
              </Typography>
              <Slider
                value={formData.painScore}
                onChange={(_, value) => handleInputChange('painScore', value)}
                min={0}
                max={10}
                marks
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[0, 2, 4, 6, 8, 10].map((score) => (
                  <Chip
                    key={score}
                    label={`${score}/10`}
                    variant={formData.painScore === score ? 'filled' : 'outlined'}
                    onClick={() => handleInputChange('painScore', score)}
                    color={formData.painScore === score ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardHeader
              title="Vital Signs"
              avatar={<VitalsIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Heart Rate (bpm)"
                    type="number"
                    value={formData.vitals.hr || ''}
                    onChange={(e) => handleVitalsChange('hr', Number(e.target.value))}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Blood Pressure"
                    value={formData.vitals.bp || ''}
                    onChange={(e) => handleVitalsChange('bp', e.target.value)}
                    margin="normal"
                    placeholder="120/80"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Respiratory Rate"
                    type="number"
                    value={formData.vitals.rr || ''}
                    onChange={(e) => handleVitalsChange('rr', Number(e.target.value))}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="SpO2 (%)"
                    type="number"
                    value={formData.vitals.spo2 || ''}
                    onChange={(e) => handleVitalsChange('spo2', Number(e.target.value))}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Temperature (°C)"
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={formData.vitals.tempC || ''}
                    onChange={(e) => handleVitalsChange('tempC', Number(e.target.value))}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Processing...' : 'Submit Intake'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.open('http://localhost:8082', '_blank')}
            >
              View Queue Dashboard
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom>
                Intake Results
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Encounter ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {result.encounterId}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Risk Assessment
                </Typography>
                <Chip
                  label={`${result.initialRisk.band} (${result.initialRisk.score}/100)`}
                  color={getRiskColor(result.initialRisk.band) as any}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Queue Position
                </Typography>
                <Typography variant="body2">
                  Priority Score: {result.queue.priorityScore}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Model: {result.initialRisk.modelVersion}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default IntakeForm;
