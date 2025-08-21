import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, FileText } from 'lucide-react';

const TextAssessment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    symptoms: '',
    duration: '',
    severity: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process the assessment and generate risk factors
    const riskFactors = {
      0: formData.severity ? parseInt(formData.severity) >= 7 : false, // High severity
      1: formData.symptoms.toLowerCase().includes('breath') || formData.symptoms.toLowerCase().includes('shortness'), // Breathing issues
      2: formData.symptoms.toLowerCase().includes('dizz') || formData.symptoms.toLowerCase().includes('confus') // Dizziness/confusion
    };
    
    navigate('/risk-assessment', { 
      state: { answers: riskFactors }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="w-8 h-8 text-warning" />
            <h1 className="text-3xl font-bold text-foreground">Text Assessment</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Please provide detailed information about your symptoms so our medical team can assist you
          </p>
        </div>

        {/* Emergency Alert */}
        <Card className="border-destructive bg-destructive/5 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                If this is a life-threatening emergency, please call 911 immediately or go to your nearest emergency room.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Patient Information & Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter your age"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="symptoms">Describe Your Symptoms *</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  placeholder="Please describe your symptoms in detail. Include what you're feeling, where it hurts, and any other relevant information..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">How long have you had these symptoms? *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 2 hours, 3 days, 1 week"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="severity">Severity (1-10) *</Label>
                  <Input
                    id="severity"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.severity}
                    onChange={(e) => handleInputChange('severity', e.target.value)}
                    placeholder="Rate pain/discomfort 1-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-foreground text-background hover:bg-foreground/90 text-lg py-6"
                disabled={!formData.name || !formData.age || !formData.symptoms || !formData.duration || !formData.severity}
              >
                Submit Assessment to Medical Team
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/choice-method')}
            className="text-muted-foreground"
          >
            ← Back to Options
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextAssessment;