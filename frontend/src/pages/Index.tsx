import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Zap, ChevronRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Medical Gradient */}
      <div className="relative min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #001f65, #6895fd)'
      }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255, 222, 89, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 222, 89, 0.2) 0%, transparent 50%)',
          }} />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-medical-warm rounded-xl shadow-lg">
                <Heart className="w-8 h-8 text-medical-warm-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-medical-primary-foreground">
                vaidy.ai
              </h1>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-medical-primary-foreground mb-6 leading-tight">
              Emergency Medical Risk Assessment
              <span className="block text-medical-warm">You Can Trust</span>
            </h2>
            
            <p className="text-lg md:text-xl text-medical-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Fast, AI-powered emergency risk evaluation to help you make informed decisions about your health when every second counts.
            </p>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Zap className="w-8 h-8 text-medical-warm mx-auto mb-3" />
                <h3 className="font-semibold text-medical-primary-foreground mb-2">Instant Assessment</h3>
                <p className="text-medical-primary-foreground/80 text-sm">Get results in under 60 seconds</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Shield className="w-8 h-8 text-medical-warm mx-auto mb-3" />
                <h3 className="font-semibold text-medical-primary-foreground mb-2">Medically Validated</h3>
                <p className="text-medical-primary-foreground/80 text-sm">Based on clinical guidelines</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Heart className="w-8 h-8 text-medical-warm mx-auto mb-3" />
                <h3 className="font-semibold text-medical-primary-foreground mb-2">AI-Powered Care</h3>
                <p className="text-medical-primary-foreground/80 text-sm">Intelligent appointment booking</p>
              </div>
            </div>

            {/* Emergency CTA */}
            <div className="space-y-4">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate("/choice-method")}
                className="text-lg px-12 py-4 shadow-2xl hover:shadow-3xl"
              >
                Start Emergency Assessment
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-medical-primary-foreground/70 text-sm">
                ⚡ Takes less than 2 minutes • Available 24/7
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 opacity-80">
            <div className="text-medical-primary-foreground/60 text-sm">🔒 HIPAA Compliant</div>
            <div className="text-medical-primary-foreground/60 text-sm">⚕️ Clinically Validated</div>
            <div className="text-medical-primary-foreground/60 text-sm">🌟 24/7 Available</div>
          </div>
        </div>

        {/* Emergency Disclaimer */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-medical-primary-foreground/60 text-center">
              ⚠️ If you're having a life-threatening emergency, call 911 immediately. This tool is for assessment purposes only and does not replace professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
