import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Brain, Camera, FileText, UserPlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const steps = [
    { icon: <UserPlus className="w-6 h-6 text-primary" />, title: '1. Create Account', desc: 'Securely register' },
    { icon: <FileText className="w-6 h-6 text-primary" />, title: '2. Basic Details', desc: 'Tell us about yourself' },
    { icon: <Brain className="w-6 h-6 text-primary" />, title: '3. Answer 30 Questions', desc: 'Adaptive questionnaire' },
    { icon: <Camera className="w-6 h-6 text-primary" />, title: '4. Optional Camera', desc: 'Facial-expression analysis' },
    { icon: <Sparkles className="w-6 h-6 text-primary" />, title: '5. Receive Profile', desc: 'Explainable stress profile' }
  ];

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center space-y-8"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary">
          StressSense
        </h1>
        <p className="text-2xl md:text-3xl text-foreground font-medium">
          AI-assisted student stress screening application
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Combining adaptive questionnaire assessment, optional facial-expression analysis, 
          stress-dimension profiling, and personalized recommendations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg rounded-xl shadow-lg">
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 py-6 text-lg rounded-xl border-2">
              Log In
            </Button>
          </Link>
        </div>

        <div className="mt-20 pt-16 border-t border-border/50">
          <h3 className="text-2xl font-semibold mb-10">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center space-y-3 p-4 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-primary/10 rounded-full">
                  {step.icon}
                </div>
                <h4 className="font-semibold text-sm">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="pt-16 max-w-2xl mx-auto mt-8">
          <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-md text-left">
            <p className="text-sm font-medium text-destructive-foreground">
              <strong>Responsible Use Statement:</strong> This is a stress screening and awareness tool, not a medical diagnosis. If you are experiencing severe distress, please seek professional medical help.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
