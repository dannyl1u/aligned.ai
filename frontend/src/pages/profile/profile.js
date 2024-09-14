import { getDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import NavBar from '../../components/navbar/navbar';
import { UserAuth } from '../../context/AuthContext'
import { db } from '../../firebase';
import './profile.scss';

const ProfileInfo = () => {
    const { user } = UserAuth();
    // console.log(user.uid);

    const [profile, setProfile] = useState({});

    const docRef = doc(db, "users", user.uid);

    useEffect(() => {
        // event.preventDefault();
        const getInfo = async () => {
            const profileSnap = await getDoc(docRef);
            setProfile(profileSnap.data());
        };
        getInfo();
    });


    return (
        <div>
            <NavBar active={'profile'}></NavBar>
            <h1>Hi, {profile.firstname} {profile.lastname}!</h1>
            <div className="info-profile">
            <div className="right-profile">
                <h1 className='title'>Personal Details</h1>
                <p><span>Full Name: </span> <span>{profile.firstname} {profile.lastname}</span></p>
                <p><span>Date of Birth: </span><span>{profile.dateBirth}</span> </p>
                <p><span>Mobile Number: </span> <span>{profile.mobile}</span></p>
                <p><span>Gender: </span> <span>{profile.gender}</span></p>
                <p><span>Country: </span> <span>{profile.country}</span></p>
                <p><span>Email: </span> <span>{profile.email}</span></p>
            </div>
            <div className="left-profile">
                <h1 className='title'>University Details</h1>
                <p><span>University:</span> <span>{profile.university}</span></p>
                <p><span>Program:</span><span>{profile.program}</span></p>
                <p><span>Year:</span> <span>{profile.year}</span></p>
                <p><span>Current Term:</span> <span>{ profile.term }</span></p>
                <p><span>Ocupation:</span> <span>{ profile.occupation }</span></p>
                <p><span>Profession: </span><span>{ profile.profession }</span></p>
                
            </div>
                
               
            </div>
            
        </div>
    );
}

export default ProfileInfo
