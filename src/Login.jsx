import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, signInWithPopup, signInWithEmailAndPassword, sendEmailVerification } from './firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email before logging in. Check your inbox for the verification email.');
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      navigate("/home");
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError('Error logging in. Please try again.');
      }
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        alert('Verification email sent again. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Error sending verification email. Please try again later.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      navigate("/home");
    } catch (error) {
      setError('Error signing in with Google.');
      console.error('Google sign-in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-white justify-center items-center">
      <div className="w-full max-w-md p-6">
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-blue-700 hover:text-blue-800 font-medium"
          >
            Need an account? <span className="underline">Sign up</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <img src="/axernlogo.png" alt="Axern" className="h-20 mb-4" />
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome to AXERN AI</h2>
            <p className="text-gray-600 text-sm text-center">Login to access our features</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                  Password
                </label>
                <a href="#forgot" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
                {error.includes('verify your email') && (
                  <button
                    type="button"
                    onClick={handleResendVerificationEmail}
                    className="text-blue-600 hover:text-blue-500 text-sm mt-2 font-medium"
                  >
                    Resend Verification Email
                  </button>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className={`w-full bg-blue-700 text-white py-3 px-4 rounded-md hover:bg-blue-800 transition-colors font-medium flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="my-6 text-center text-sm text-gray-500">or continue with</div>

          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center font-medium"
          >
            <img src="/google.png" alt="Google icon" className="w-5 h-5 mr-3" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
