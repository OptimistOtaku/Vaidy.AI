import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Heart, Phone, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const RiskAssessment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const answers = location.state?.answers || {};

  useEffect(() => {
    // Calculate risk based on answers
    const yesCount = Object.values(answers).filter(answer => answer === true).length;
    const score = (yesCount / 3) * 100;
    
    setRiskScore(score);
    
    if (score >= 67) {
      setRiskLevel("HIGH RISK");
      setRecommendations([
        "Seek immediate emergency medical attention",
        "Call 911 or go to the nearest emergency room",
        "Do not drive yourself - have someone drive you or call an ambulance"
      ]);
    } else if (score >= 34) {
      setRiskLevel("MODERATE RISK");
      setRecommendations([
        "Contact your healthcare provider immediately",
        "Consider visiting urgent care or emergency room",
        "Monitor symptoms closely"
      ]);
    } else {
      setRiskLevel("LOW RISK");
      setRecommendations([
        "Monitor symptoms and contact healthcare provider if they worsen",
        "Consider scheduling a routine appointment",
        "Practice self-care and rest"
      ]);
    }
  }, [answers]);

  const handleBookAppointment = () => {
    // This would integrate with Bud AI in real implementation
    alert("Bud AI appointment booking would be integrated here!");
  };

  const getRiskColor = (score: number) => {
    if (score >= 67) return "text-red-600";
    if (score >= 34) return "text-orange-600";
    return "text-green-600";
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 67) return "bg-red-50 border-red-200";
    if (score >= 34) return "bg-orange-50 border-orange-200";
    return "bg-green-50 border-green-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-primary to-medical-primary-light">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-medical-primary-foreground mb-2">
              Risk Assessment Results
            </h1>
            <p className="text-medical-primary-foreground/80">
              Based on your responses, here's your emergency risk evaluation
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Risk Score Card */}
            <Card className={`p-6 ${getRiskBgColor(riskScore)} border-2`}>
              <div className="text-center">
                <div className="mb-4">
                  <AlertTriangle className={`w-12 h-12 mx-auto ${getRiskColor(riskScore)}`} />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${getRiskColor(riskScore)}`}>
                  {riskLevel}
                </h2>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-2">{Math.round(riskScore)}%</div>
                  <Progress value={riskScore} className="h-3" />
                </div>
              </div>
            </Card>

            {/* Risk Factors Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-medical-primary" />
                Assessment Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  "Chest Pain",
                  "Breathing Difficulty", 
                  "Dizziness/Confusion"
                ].map((symptom, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-medical-clean-foreground">{symptom}</span>
                    <span className={`font-medium ${
                      answers[index] === true ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {answers[index] === true ? 'Present' : 'Not Present'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-medical-primary mt-0.5 flex-shrink-0" />
                  <span className="text-medical-clean-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={handleBookAppointment}
              className="flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Book with Bud AI
            </Button>
            <Button
              variant="medical"
              size="xl"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Find Nearby Hospital
            </Button>
          </div>

          {/* Emergency Contact */}
          {riskScore >= 67 && (
            <Card className="p-6 mt-6 bg-red-50 border-red-200 border-2">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  EMERGENCY ALERT
                </h3>
                <p className="text-red-700 mb-4">
                  Your symptoms indicate a potential medical emergency
                </p>
                <Button 
                  variant="destructive" 
                  size="xl"
                  className="w-full max-w-sm"
                  onClick={() => window.open('tel:911')}
                >
                  🚨 CALL 911 NOW
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;