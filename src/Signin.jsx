import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  auth, 
  provider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from './firebase';
// import google from './images/google.png';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user);
  
      console.log('New User Created:', user);
      alert(`Account created successfully! A verification email has been sent to ${user.email}. Please verify your email before logging in.`);
      setEmail('');
      setPassword('');
      setError('');
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Error creating account. Please try again.');
      }
      console.error('Error during sign-up:', error);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User:', user);
      alert(`Welcome ${user.displayName}`);
      setProfilePic(user.photoURL);
    } catch (error) {
      setError('Error signing in with Google. Please try again.');
      console.error('Error during Google sign-in:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Company branding sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 bg-blue-700 text-white justify-center items-center p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Welcome to AXERN AI</h1>
          <p className="text-xl mb-8">Create an account to access premium features and start your journey with us.</p>
          <div className="bg-blue-600 p-6 rounded-lg">
            <p className="italic text-lg mb-4">"Join Axern Ai and you will get unlimited access to prompt generating"</p>
          </div>
        </div>
      </div>
      
      {/* Form area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        {/* Login Button (Top Right Corner) */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => navigate('/login')} 
            className="text-blue-700 hover:text-blue-800 font-medium"
          >
            Already have an account? <span className="underline">Log in</span>
          </button>
        </div>

        {/* Company logo for mobile */}
        <div className="lg:hidden mb-8">
          <div className="h-12 w-12 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
        </div>
        
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Create Account</h2>
          <p className="text-gray-600 mb-8">Join thousands of professionals using our platform</p>
          
          {/* Email/Password Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="mb-6">
            <div className="mb-5">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                required
                placeholder="name@company.com"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                required
                placeholder="Minimum 6 characters"
                minLength="6"
              />
              <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                <div className="flex">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 px-4 rounded-md hover:bg-blue-800 transition-colors font-medium"
            >
              Create Your Account
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center font-medium"
          >
            {/* <img src={google} alt="Google icon" className="w-5 h-5 mr-3" /> */}
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;