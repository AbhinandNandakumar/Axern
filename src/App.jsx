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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
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