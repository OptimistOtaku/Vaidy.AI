import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mic, MicOff, PhoneOff } from 'lucide-react';

const VoiceCall = () => {
  const navigate = useNavigate();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setIsCallActive(true);
    // Simulate call ending after 30 seconds for demo
    setTimeout(() => {
      endCall();
    }, 30000);
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    // Simulate collecting assessment data from the call
    const mockAnswers = {
      0: Math.random() > 0.5, // Chest Pain
      1: Math.random() > 0.5, // Breathing Difficulty
      2: Math.random() > 0.5  // Dizziness/Confusion
    };
    
    navigate('/risk-assessment', { 
      state: { answers: mockAnswers }
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Phone className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Voice Call with Bud AI</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Speak directly with our AI assistant about your symptoms
          </p>
        </div>

        {/* Call Interface */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl">
              {isCallActive ? 'Connected to Bud AI' : 'Ready to Connect'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isCallActive ? (
              <>
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-16 h-16 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Tap the call button below to start speaking with Bud AI about your symptoms
                </p>
                <Button
                  onClick={startCall}
                  size="lg"
                  className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Start Call
                </Button>
              </>
            ) : (
              <>
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Mic className={`w-16 h-16 ${isMuted ? 'text-red-500' : 'text-green-600'}`} />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-green-600">Call Active</p>
                  <p className="text-2xl font-mono">{formatTime(callDuration)}</p>
                  <p className="text-muted-foreground">
                    Bud AI is listening to your symptoms and analyzing your condition...
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={toggleMute}
                    className={isMuted ? 'bg-red-50 border-red-200' : ''}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={endCall}
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Call
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/choice-method')}
            className="text-muted-foreground"
            disabled={isCallActive}
          >
            ← Back to Options
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCall;