"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, profilePicture: File | null) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (name: string, profilePicture: File | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedCredentials = localStorage.getItem("credentials");
    if (savedUser && savedCredentials) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const signup = async (email: string, password: string, name: string, profilePicture: File | null) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Check if user already exists
    const existingCredentials = localStorage.getItem("credentials");
    if (existingCredentials) {
      const credentials = JSON.parse(existingCredentials);
      if (credentials.email === email) {
        throw new Error("An account with this email already exists");
      }
    }

    // Handle profile picture
    let profilePictureUrl = "";
    if (profilePicture) {
      profilePictureUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(profilePicture);
      });
    }

    // Create new user
    const newUser: User = {
      name,
      email,
      profilePicture: profilePictureUrl,
      stats: {
        tripsCreated: 0,
        itemsPacked: 0,
        peopleCollaborated: 0,
      },
    };

    // Store credentials securely (in a real app, this would be hashed)
    const credentials = { email, password };
    localStorage.setItem("credentials", JSON.stringify(credentials));
    localStorage.setItem("user", JSON.stringify(newUser));

    setUser(newUser);
    setIsAuthenticated(true);
  };

  const login = async (email: string, password: string) => {
    try {
      // Get stored credentials
      const storedCredentials = localStorage.getItem("credentials");
      if (!storedCredentials) {
        throw new Error("No account found with this email");
      }

      const credentials = JSON.parse(storedCredentials);
      
      // Check if email exists
      if (credentials.email !== email) {
        throw new Error("No account found with this email");
      }

      // Check if password matches
      if (credentials.password !== password) {
        throw new Error("Invalid password");
      }

      // Get user data
      const savedUser = localStorage.getItem("user");
      if (!savedUser) {
        throw new Error("User data not found");
      }

      const userData = JSON.parse(savedUser);
      
      // Verify the user data matches the credentials
      if (userData.email !== email) {
        throw new Error("User data mismatch");
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred during login");
    }
  };

  const updateProfile = async (name: string, profilePicture: File | null) => {
    if (!user) return;

    let profilePictureUrl = user.profilePicture;
    if (profilePicture) {
      profilePictureUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(profilePicture);
      });
    }

    const updatedUser = {
      ...user,
      name,
      profilePicture: profilePictureUrl,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, isAuthenticated, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 