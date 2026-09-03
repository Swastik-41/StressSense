import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, AlertCircle, TrendingUp, Sparkles, BrainCircuit } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import api from '../services/api';

export default function Result() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/api/assessment/${assessmentId}/result`);
        setResult(res.data);
      } catch (error) {
        console.error("Failed to fetch result:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Analyzing your results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-700 dark:text-gray-300 font-medium">Result not found or an error occurred.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-500 font-medium hover:underline">Return Home</button>
      </div>
    );
  }

  // Determine colors based on stress level
  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'moderate': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'high': return 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
    }
  };

  const levelColorClass = getLevelColor(result.stress_level);
  
  // Format data for radar chart
  const radarData = result.categories.map(c => ({
    subject: c.category,
    A: Math.round(c.score),
    fullMark: 100
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-6 space-y-8"
    >
      {/* Header Section */}
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Stress Assessment</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Based on your questionnaire responses and facial expressions, here is your comprehensive analysis.
        </p>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score Card */}
        <div className={`md:col-span-1 rounded-2xl border p-6 flex flex-col items-center justify-center text-center ${levelColorClass}`}>
          <h2 className="text-lg font-medium opacity-80 mb-2">Overall Stress Level</h2>
          <div className="text-4xl font-bold mb-2">{result.stress_level}</div>
          <div className="text-sm font-medium opacity-75">Score: {Math.round(result.overall_score)}/100</div>
        </div>
        
        {/* Primary Factor */}
        <div className="md:col-span-1 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col justify-center">
          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="w-5 h-5 mr-2" />
            <h2 className="text-sm font-medium">Primary Factor</h2>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">{result.primary_factor}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">This dimension contributed most to your overall score.</p>
        </div>

        {/* Fusion Stats */}
        <div className="md:col-span-1 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col justify-center space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Questionnaire Score</span>
              <span className="font-medium text-gray-900 dark:text-white">{Math.round(result.questionnaire_score)}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${result.questionnaire_score}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Facial Score</span>
              <span className="font-medium text-gray-900 dark:text-white">{Math.round(result.facial_score)}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${result.facial_score}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Why this result? */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-6 sm:p-8">
        <div className="flex items-start">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm mr-4 mt-1">
            <BrainCircuit className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Why this result?</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
              Your overall stress level is determined by fusing self-reported answers and facial expressions. 
              We observed a <strong>{result.signal_agreement.toLowerCase()}</strong> between what you reported and what your expressions conveyed. 
              The facial analysis was factored in with a reliability of {Math.round(result.facial_reliability)}%. 
              Our confidence in this assessment is {Math.round(result.confidence_score)}%.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Stress Dimensions</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center mb-6">
            <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personalized Recommendations</h3>
          </div>
          <div className="space-y-4">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{rec.category}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{rec.recommendation_text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 pb-12">
        <button
          onClick={() => navigate('/assessment')}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Retake Assessment</span>
        </button>
        <button
          onClick={() => navigate('/history')}
          className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-8 py-3 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto"
        >
          <span>View History</span>
        </button>
      </div>
    </motion.div>
  );
}
