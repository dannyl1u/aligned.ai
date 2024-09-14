import { createContext, useContext, useEffect, useState } from "react";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { auth } from "../firebase";

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
    // Set state for user (otherwise no access to it)
    const [user, setUser] = useState({});

    // Sign up function
    const createUser = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Login function
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Logout function
    const logout = () => {
        return signOut(auth);
    };

    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            //console.log(currentUser);
            setUser(currentUser);
        });
        return () => {
            unsubscribe();
        }
    })

    return (
        <UserContext.Provider value={{ createUser, user, logout, login}}>
            { children }
        </UserContext.Provider>
    );
}

export const UserAuth = () => {
    return useContext(UserContext)

}
