import { useState, useEffect } from 'react';
import axios from 'axios';
import { useProofOfWork } from './hooks/useProofOfWork';

function App() {
  const [userId, setUserId] = useState('');
  const [powChallenge, setPowChallenge] = useState(null);
  const [actionAllowed, setActionAllowed] = useState(false);
  const [loading, setLoading] = useState(false);

  const { status, nonce, hash } = useProofOfWork(powChallenge);

  const handleUserAction = async () => {
    if (!userId.trim()) return;
    
    setLoading(true);
    try {
      const res = await axios.post('http://192.168.1.16:3000/user-action', { userId });
      if (res.status === 200) {
        setActionAllowed(true);
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.challenge) {
        setPowChallenge(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sendSolution = async () => {
      if (status === 'done' && powChallenge) {
        try {
          const res = await axios.post('http://192.168.1.16:3000/verify-pow', {
            userId,
            nonce,
            challenge: powChallenge.challenge,
            signature: powChallenge.signature,
          });
          if (res.status === 200) {
            setActionAllowed(true);
          }
        } catch (err) {
          console.error
        }
      }
    };

    sendSolution();
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-center">
          Proof of Work Demo
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              id="userId"
              type="text"
              placeholder="Enter your ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition"
            />
          </div>
          
          <button
            onClick={handleUserAction}
            disabled={status === 'solving' || loading || !userId.trim()}
            className={`w-full py-2 px-4 rounded-lg font-medium transition
              ${status === 'solving' || loading 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'}
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : status === 'solving' ? (
              'Solving Challenge...'
            ) : (
              'Try Action'
            )}
          </button>
        </div>
        
        {actionAllowed && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Access granted! You may proceed.</span>
            </div>
          </div>
        )}
        
        {status && status !== 'done' && (
          <div className="text-sm text-gray-500 text-center">
            {status === 'solving' ? 'Solving Proof of Work challenge...' : 'Ready'}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;