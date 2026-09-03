import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Calendar, ChevronRight, Activity } from 'lucide-react';
import api from '../services/api';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/assessment/history/list');
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your history...</p>
      </div>
    );
  }

  const getLevelColor = (level) => {
    if (!level) return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    switch (level.toLowerCase()) {
      case 'low': return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30';
      case 'moderate': return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30';
      case 'high': return 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30';
      default: return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/10 p-3 rounded-full">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assessment History</h1>
        </div>
        <button
          onClick={() => navigate('/assessment')}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <span>Retake Assessment</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't completed any assessments yet.</p>
          <button
            onClick={() => navigate('/assessment')}
            className="text-blue-600 font-medium hover:underline"
          >
            Start your first assessment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => item.status === 'completed' && navigate(`/result/${item.id}`)}
              className={`
                bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5
                flex flex-col sm:flex-row sm:items-center justify-between transition-all duration-200
                ${item.status === 'completed' ? 'cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800' : 'opacity-70'}
              `}
            >
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mr-4 flex-shrink-0">
                  <Calendar className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(item.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {item.status === 'completed' ? `Score: ${Math.round(item.overall_score)}/100` : 'In Progress'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                {item.status === 'completed' && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold mr-4 ${getLevelColor(item.stress_level)}`}>
                    {item.stress_level} Stress
                  </span>
                )}
                {item.status === 'completed' && (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
