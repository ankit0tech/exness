import { Route, Routes } from 'react-router-dom';
import './App.css'
import Login from './pages/Login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';
import NavBar from './components/NavBar';
import AccountDetails from './pages/AccountDetails.js';


function App() {

  return (
    <div className='h-full w-full'>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <div className='sticky top-0 z-40 bg-white'>
          <NavBar />
        </div>

        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/account' element={<AccountDetails />} />
        </Routes>
        
      </GoogleOAuthProvider>
    </div>
  );
}

export default App
