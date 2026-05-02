import { Route, Routes } from 'react-router-dom';
import './App.css'
import Login from './pages/Login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';
import NavBar from './components/NavBar';
import AccountDetails from './pages/AccountDetails.js';
import Instruments from './pages/Instruments.js';
import InstrumentDetails from './pages/InstrumentDetails.js';
import InstrumentCreate from './pages/InstrumentCreate.js';
import AdminDashboard from './pages/AdminDashboard.js';

function App() {

  const user_role = localStorage.getItem('role');

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

          {
            user_role === 'ADMIN' && (
              <>
                <Route path='admin/dashboard' element={<AdminDashboard />} />
                <Route path='admin/instruments' element={<Instruments />} />
                <Route path='admin/instrument/details/:id' element={<InstrumentDetails />} />
                <Route path='admin/instrument/create' element={<InstrumentCreate />} />
                <Route path='admin/instrument/edit/:id' element={<InstrumentCreate />} />
              </>
            )
          }

        </Routes>
        
      </GoogleOAuthProvider>
    </div>
  );
}

export default App
