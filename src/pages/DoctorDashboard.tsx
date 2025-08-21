import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';

interface PatientAssessment {
  name: string;
  age: string;
  symptoms: string;
  duration: string;
  severity: string;
  timestamp: string;
}

const DoctorDashboard = () => {
  const [assessment, setAssessment] = useState<PatientAssessment | null>(null);

  useEffect(() => {
    const storedAssessment = localStorage.getItem('patientAssessment');
    if (storedAssessment) {
      setAssessment(JSON.parse(storedAssessment));
    }
  }, []);

  const getSeverityColor = (severity: string) => {
    const severityNum = parseInt(severity);
    if (severityNum >= 8) return 'destructive';
    if (severityNum >= 6) return 'destructive';
    if (severityNum >= 4) return 'secondary';
    return 'default';
  };

  const getSeverityLabel = (severity: string) => {
    const severityNum = parseInt(severity);
    if (severityNum >= 8) return 'URGENT';
    if (severityNum >= 6) return 'HIGH';
    if (severityNum >= 4) return 'MODERATE';
    return 'LOW';
  };

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Assessment Data</h2>
            <p className="text-muted-foreground">
              No patient assessment data found. Please ensure a patient has submitted their information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Patient Assessment Review</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date(assessment.timestamp).toLocaleString()}</span>
          </div>
        </div>

        {/* Priority Alert */}
        {parseInt(assessment.severity) >= 7 && (
          <Card className="border-destructive bg-destructive/5 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">HIGH PRIORITY PATIENT</p>
                  <p className="text-sm">This patient has reported high severity symptoms and requires immediate attention.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-semibold">{assessment.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="font-semibold">{assessment.age} years old</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Symptom Duration</p>
                <p className="font-semibold">{assessment.duration}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Severity Level</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(assessment.severity)}>
                    {getSeverityLabel(assessment.severity)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {assessment.severity}/10
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default">
                <Phone className="w-4 h-4 mr-2" />
                Call Patient
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button className="w-full" variant="outline">
                <MapPin className="w-4 h-4 mr-2" />
                Find Nearest Hospital
              </Button>
            </CardContent>
          </Card>

          {/* Symptoms Detail */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detailed Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-foreground leading-relaxed">
                  {assessment.symptoms}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button size="lg" className="bg-primary text-primary-foreground">
            Respond to Patient
          </Button>
          <Button size="lg" variant="outline">
            Forward to Specialist
          </Button>
          <Button size="lg" variant="outline">
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;