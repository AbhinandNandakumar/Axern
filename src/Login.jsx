import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, signInWithPopup, signInWithEmailAndPassword, sendEmailVerification } from './firebase';
// Import company logo here
// import companyLogo from './images/company-logo.png';

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
        await auth.signOut();  // Force logout if not verified
        setIsLoading(false);
        return;
      }

      // Success - redirect to home
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
      console.log('Google Login:', user);
      navigate("/home");
    } catch (error) {
      setError('Error signing in with Google.');
      console.error('Google sign-in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed flex justify-center items-center min-h-screen inset-0 bg-cover bg-center" >
      
      <div className="w-full max-w-md p-6">
        {/* Sign Up Button (Top Right Corner) */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-white hover:text-blue-300 font-medium"
          >
            Need an account? <span className="underline">Sign up</span>
          </button>
        </div>
        
        {/* Card Container */}
        <div className="bg-gray-900/70 rounded-xl border border-gray-700 backdrop-blur-md shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="flex flex-col items-center justify-center p-6">
            <div className="h-16 w-16 bg-blue-700 rounded-full flex items-center justify-center mb-4">
              {/* Replace with your company logo */}
              {/* <img src={companyLogo} alt="Company Logo" className="w-12 h-12" /> */}
              {/* Placeholder text if no logo available */}
              <span className="text-white text-2xl font-bold">A</span>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-white">Welcome to AXERN AI</h2>
            <p className="text-gray-400 text-sm text-center mb-4">
              Sign in to access premium features and continue your journey with us
            </p>
          </div>
          
          {/* Login Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="password" className="block text-gray-300 text-sm font-medium">
                    Password
                  </label>
                  <a href="#forgot" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm">{error}</p>
                      {error === 'Please verify your email before logging in. Check your inbox for the verification email.' && (
                        <button
                          type="button"
                          onClick={handleResendVerificationEmail}
                          className="text-blue-400 hover:text-blue-300 text-sm mt-2 font-medium"
                        >
                          Resend Verification Email
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                className={`w-full bg-blue-700 text-white py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors font-medium flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Log in'
                )}
              </button>
            </form>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button 
              onClick={handleGoogleLogin} 
              className="w-full border border-gray-600 bg-gray-800/70 text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center font-medium"
              disabled={isLoading}
            >
              {/* Google Icon */}
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
                <path d="M6.44 14.08l1.227-1.12 3.52-2.893-.16-.16H6.44v4.173z" fill="#34A853"/>
                <path d="M12.48 10.92v-3.6H6.44v4.173h4.587l1.453-1.12v.547z" fill="#FABB05"/>
                <path d="M12.48 7.32v3.6l3.587-2.32-1.44-1.28H12.48z" fill="#E94235"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;