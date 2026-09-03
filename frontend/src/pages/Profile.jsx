import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

export default function Profile() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    student_status: '',
    academic_level: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/users/me')
      .then(res => {
        if (res.data) {
          if (res.data.age && res.data.gender && res.data.student_status && res.data.academic_level) {
            navigate('/history');
          } else {
            setFormData({
              age: res.data.age || '',
              gender: res.data.gender || '',
              student_status: res.data.student_status || '',
              academic_level: res.data.academic_level || ''
            });
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setInitialLoad(false));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10)
      };
      await api.put('/api/users/me', payload);
      navigate('/consent');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return <div className="text-center p-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Basic Information</CardTitle>
          <CardDescription className="text-center">
            Tell us a bit about yourself
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm bg-red-100 text-red-700 rounded-md">
                {typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age" 
                type="number" 
                min="10" 
                max="99" 
                required 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select 
                id="gender"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="" disabled>Select gender</option>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_status">Student Status</Label>
              <select 
                id="student_status"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.student_status}
                onChange={(e) => setFormData({...formData, student_status: e.target.value})}
              >
                <option value="" disabled>Select status</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic_level">Academic Level</Label>
              <select 
                id="academic_level"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.academic_level}
                onChange={(e) => setFormData({...formData, academic_level: e.target.value})}
              >
                <option value="" disabled>Select level</option>
                <option value="School">School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
