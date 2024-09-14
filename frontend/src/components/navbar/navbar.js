import React from "react";
import "./navbar.scss";

import icon from './icon.svg';
import { Navigate, useNavigate } from 'react-router-dom';

import { UserAuth } from '../../context/AuthContext';


const NavBar = ({active}) => {
    const navigate = useNavigate();

    const { user, logout } = UserAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            console.log('you are logged out');
        } catch (e) {
            console.log(e.message);
        }
    }

  return (
    <div className="section">
      <div className="container">
        <div className="navbar-wrapper">
          <div role="button" className="name" tabIndex={0}>
          <img className='__button' src={icon} alt="add"></img>
          </div>
          <div className="links-wrapper">
          <button className={ (active === 'profile') ? 'active' : null } onClick={() => navigate("/home/profile")}>
              My Profile
            </button>
            <button onClick={() => navigate("/home/add-class")}>
               Add Classes
            </button>
            <button className={ (active === 'schedule') ? 'active' : null } onClick={() => navigate("/home/my-schedule")}>
               My Schedule
            </button>
            <button className={ (active === 'friends') ? 'active' : null } onClick={() => navigate("/home/add-friends")}>
                Add Friends
            </button>
            <button className={ (active === 'same') ? 'active' : null } onClick={() => navigate("/home/classes")}>
                Same Classes
            </button>
            <button className="signout" onClick={handleLogout}>
                Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;