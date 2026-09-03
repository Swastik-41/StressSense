import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Camera, ShieldAlert } from 'lucide-react';

export default function Consent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">What this assessment does</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground/90 text-lg text-center">
            This assessment analyzes your answers and optional facial-expression signals to estimate indicators of current stress.
          </p>
          
          <div className="bg-muted p-4 rounded-lg flex gap-4 items-start">
            <Camera className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold">Camera Access</h4>
              <p className="text-muted-foreground text-sm mt-1">
                Camera access is used during the assessment for facial-expression analysis. If you deny access, the assessment will continue using only your questionnaire responses. We do not permanently store raw images or video.
              </p>
            </div>
          </div>
          
          <div className="bg-secondary/20 border border-secondary p-4 rounded-lg flex gap-4 items-start">
            <ShieldAlert className="w-6 h-6 text-secondary-foreground shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-secondary-foreground">Important</h4>
              <p className="text-secondary-foreground/90 text-sm mt-1">
                This application is not a medical diagnosis. It is designed for student stress awareness and screening.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Cancel
          </Button>
          <Button onClick={() => navigate('/instructions')}>
            I Understand & Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
