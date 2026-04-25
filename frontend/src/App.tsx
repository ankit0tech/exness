import { Route, Routes } from 'react-router-dom';
import './App.css'
import Login from './pages/Login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';


function App() {

  return (
    <div className='h-full w-full'>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App
