import React, { createContext, useContext, useState } from "react";

// Create Context
const AuthContext = createContext();

// Custom Hook to use Context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Function to log in user
    const login = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login }}>
            {children}
        </AuthContext.Provider>
    );
}
