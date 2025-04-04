import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { useEffect, useState } from 'react';
import FrontPage from './FrontPage';
import SignIn from './Signin';
import Login from './Login';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const keepAlive = () => {
    fetch("https://axern.onrender.com/keep-alive")
      .then((res) => res.json())
      .then((data) => console.log("Keep alive response:", data))
      .catch((err) => console.error("Keep alive error:", err));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(keepAlive, 2 * 60 * 1000); // Every 2 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center p-8 text-gray-400">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/frontpage" /> : <SignIn />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/frontpage" /> : <Login />} 
        />
<Route 
  path="/frontpage" 
  element={user?.emailVerified ? <><Navbar user={user} /><FrontPage /></> : <Navigate to="/" />} 
/>
      </Routes>
    </Router>
  );
}

export default App;