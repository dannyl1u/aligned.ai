import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Landing from './pages/landing/Landing.js';
import Signup from './pages/signup/Signup.js';
import Login from './pages/login/Login.js';
import Home from './pages/home/Home.js';
import { AuthContextProvider } from './context/AuthContext.js';
import ProtectedRoute from './ProtectedRoute.js';
import Add from './pages/add-classes/Add.js';
import Schedule from './pages/my-schedule/schedule.js';
import Friends from './pages/add-friends/friends.js';
import Classes from './pages/classes/classes.js';
import Details from './pages/details/details.js';
import ProfileInfo from './pages/profile/profile.js';

function App() {
  return (
    <div>
      <AuthContextProvider>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />}/>
          {/* Sign up page */}
          <Route path="/signup" element={<Signup />}/>
          {/* Login page */}
          <Route path="/login" element={<Login />}/>
          {/* Details Page */}
          <Route path="/details" element={
            <ProtectedRoute><Details /></ProtectedRoute> 
          }/>
          {/* Home page */}
          <Route path="/home" element={
            <ProtectedRoute><Home /></ProtectedRoute> 
          }/>
          {/* Profile Info */}
          <Route path="/home/profile" element={
            <ProtectedRoute><ProfileInfo /></ProtectedRoute> 
          }/>
          {/* My Schedule */}
          <Route path="/home/my-schedule" element={
            <ProtectedRoute><Schedule /></ProtectedRoute> 
          }/>
          {/* Add Friends */}
          <Route path="/home/add-friends" element={
            <ProtectedRoute><Friends /></ProtectedRoute> 
          }/>
          {/* Same Classes */}
          <Route path="/home/classes" element={
            <ProtectedRoute><Classes /></ProtectedRoute> 
          }/>
          {/* Add more pages below - routing as home/{page-name} to keep as protected routing */}
          <Route path="/home/add-class" element={
            <ProtectedRoute><Add /></ProtectedRoute> 
          }/>
        </Routes>
      </AuthContextProvider>
      
    </div>
  );
}

export default App;
