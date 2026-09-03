import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Assessment() {
  const navigate = useNavigate();
  const [assessmentId, setAssessmentId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Tallies for facial analysis
  const tallies = useRef({
    total: 0,
    success: 0,
    happy: 0,
    neutral: 0,
    sad: 0
  });

  // Start assessment on mount
  useEffect(() => {
    const startAssessment = async () => {
      try {
        const res = await api.post('/api/assessment/start');
        setAssessmentId(res.data.id);
        fetchNextQuestion(res.data.id);
      } catch (error) {
        console.error("Failed to start assessment:", error);
      }
    };
    startAssessment();
  }, []);

  // Set up camera
  useEffect(() => {
    let stream = null;
    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        console.log("[Camera] Access granted and stream assigned.");
      } catch (error) {
        console.error("[Camera] Access denied or failed:", error);
        setCameraActive(false);
      }
    };
    initCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Process frames periodically
  useEffect(() => {
    if (!cameraActive || !assessmentId) return;
    
    console.log("[FACIAL] camera stream ready");
    
    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;
      if (progressRef.current >= 30) return;
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Ensure video has loaded metadata and is ready before capturing
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.5);
      console.log("[FACIAL] frame capture started");
      console.log("[FACIAL] frame captured");
      
      try {
        tallies.current.total += 1;
        console.log("[FACIAL] sending frame");
        const res = await api.post(`/api/assessment/${assessmentId}/process-frame`, {
          image: base64Image
        });
        
        console.log("[FACIAL] frame API response");
        if (res.data.face_found) {
          tallies.current.success += 1;
          tallies.current.happy += res.data.happy;
          tallies.current.neutral += res.data.neutral;
          tallies.current.sad += res.data.sad;
          console.log(`[FACIAL] prediction = happy:${res.data.happy.toFixed(2)} neutral:${res.data.neutral.toFixed(2)} sad:${res.data.sad.toFixed(2)}`);
          console.log(`[FACIAL] observation stored`);
          console.log(`[FACIAL] observation count = ${tallies.current.success}`);
        }
      } catch (error) {
        console.error("[FACIAL] Failed to process frame on backend:", error);
      }
    }, 3000); // Process frame every 3 seconds
    
    return () => clearInterval(interval);
  }, [cameraActive, assessmentId]);

  const fetchNextQuestion = async (id) => {
    try {
      const res = await api.get(`/api/assessment/${id}/next-question`);
      if (res.data.id === "completed" || res.data.progress >= 30) {
        completeAssessment(id);
      } else {
        setQuestion(res.data);
        setProgress(res.data.progress);
        setSelectedOption(null);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Failed to fetch next question:", error);
    }
  };

  const completeAssessment = async (id) => {
    try {
      const reliability = tallies.current.total > 0 ? (tallies.current.success / tallies.current.total) * 100 : 0;
      console.log(`[FACIAL] reliability = ${reliability.toFixed(2)}%`);
      await api.post(`/api/assessment/${id}/complete`, {
        total_frames_processed: tallies.current.total,
        successful_frames: tallies.current.success,
        happy_total: tallies.current.happy,
        neutral_total: tallies.current.neutral,
        sad_total: tallies.current.sad
      });
      navigate(`/result/${id}`);
    } catch (error) {
      console.error("Failed to complete assessment:", error);
    }
  };

  const handleOptionClick = async (option) => {
    if (isSubmitting || !question || !assessmentId) return;
    
    setSelectedOption(option);
    setIsSubmitting(true);
    
    // Simulate slight delay for animation
    setTimeout(async () => {
      try {
        await api.post(`/api/assessment/${assessmentId}/answer`, {
          selected_option: option
        });
        fetchNextQuestion(assessmentId);
      } catch (error) {
        console.error("Failed to submit answer:", error);
        setIsSubmitting(false);
      }
    }, 500); // 500ms delay for feedback animation
  };

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Preparing your assessment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto py-8">
      {import.meta.env.VITE_AUTH_MODE === 'mock' && (
        <div className="mb-4 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-600 text-xs text-center font-medium">
          DEVELOPMENT MODE (Mock Auth)
        </div>
      )}
      {/* Hidden camera elements */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Progress & Camera Status */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          <span>Question {progress + 1} of 30</span>
        </div>
        <div className="flex items-center space-x-2 text-sm font-medium">
          {cameraActive ? (
            <span className="flex items-center text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
              <Camera className="w-4 h-4 mr-1" /> Active
            </span>
          ) : (
            <span className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full">
              <CameraOff className="w-4 h-4 mr-1" /> Unavailable
            </span>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-10 overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: `${(progress / 30) * 100}%` }}
          animate={{ width: `${((progress + 1) / 30) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center leading-relaxed">
            {question.question_text}
          </h2>
          
          <div className="flex flex-col space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === option;
              return (
                <button
                  key={index}
                  disabled={isSubmitting}
                  onClick={() => handleOptionClick(option)}
                  className={`
                    w-full p-4 rounded-xl text-left font-medium transition-all duration-200 border-2
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 transform scale-[1.02]' 
                      : 'border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}
                    ${isSubmitting && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-center">
                    <div className={`
                      w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center
                      ${isSelected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'}
                    `}>
                      {isSelected && <motion.div layoutId="dot" className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                    </div>
                    {option}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
