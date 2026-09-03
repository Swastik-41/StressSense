import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { ListChecks, Timer, BrainCircuit, Camera } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';

export default function Instructions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/assessment/start');
      navigate(`/assessment?id=${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start assessment. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Assessment Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-4">
            <li className="flex gap-4 items-center bg-card border p-4 rounded-lg">
              <ListChecks className="w-6 h-6 text-primary shrink-0" />
              <p className="text-sm">You will answer exactly <strong>30 multiple-choice questions</strong> based on how you have been feeling recently.</p>
            </li>
            <li className="flex gap-4 items-center bg-card border p-4 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-primary shrink-0" />
              <p className="text-sm">The system may present questions in different orders depending on your previous responses.</p>
            </li>
            <li className="flex gap-4 items-center bg-card border p-4 rounded-lg">
              <Camera className="w-6 h-6 text-primary shrink-0" />
              <p className="text-sm">Your camera may be used to analyze facial expressions during the assessment.</p>
            </li>
            <li className="flex gap-4 items-center bg-card border p-4 rounded-lg">
              <Timer className="w-6 h-6 text-primary shrink-0" />
              <p className="text-sm">Estimated time: <strong>5–10 minutes.</strong></p>
            </li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <Button size="lg" className="w-full sm:w-auto px-12" onClick={startAssessment} disabled={loading}>
            {loading ? 'Starting...' : 'Start Assessment'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
