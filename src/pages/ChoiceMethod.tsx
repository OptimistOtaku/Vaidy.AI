import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Phone } from "lucide-react";

const ChoiceMethod = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-medical-clean-warm">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-medical-clean-foreground mb-2">
              How would you like to share your symptoms?
            </h1>
            <p className="text-medical-clean-foreground/70">
              Choose your preferred method to get emergency medical assessment
            </p>
          </div>

          {/* Options */}
          <div className="grid gap-6">
            {/* Text Description Option */}
            <Card className="p-8 border border-medical-primary/10 shadow-sm hover:shadow-md transition-all">
              <div className="text-center">
                <div className="mb-4">
                  <MessageSquare className="w-12 h-12 text-medical-primary mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-medical-clean-foreground mb-3">
                  Describe Your Problem
                </h3>
                <p className="text-medical-clean-foreground/70 mb-6">
                  Type your symptoms and get instant AI-powered risk assessment
                </p>
                <Button
                  variant="medical"
                  size="lg"
                  onClick={() => navigate("/text-assessment")}
                  className="w-full"
                >
                  Start Text Assessment
                </Button>
              </div>
            </Card>

            {/* Voice Call Option */}
            <Card className="p-8 border border-medical-primary/10 shadow-sm hover:shadow-md transition-all">
              <div className="text-center">
                <div className="mb-4">
                  <Phone className="w-12 h-12 text-medical-warm mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-medical-clean-foreground mb-3">
                  Call Bud AI
                </h3>
                <p className="text-medical-clean-foreground/70 mb-6">
                  Speak directly with our AI assistant for immediate help
                </p>
                <Button
                  variant="emergency"
                  size="lg"
                  onClick={() => navigate("/voice-call")}
                  className="w-full"
                >
                  Start Voice Call
                </Button>
              </div>
            </Card>
          </div>

          {/* Emergency Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-medical-clean-foreground/60">
              ⚠️ If you're having a life-threatening emergency, call 911 immediately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoiceMethod;