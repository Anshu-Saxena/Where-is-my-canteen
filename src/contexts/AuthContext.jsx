import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEFAULT_USERS = {
  student: {
    id: 'usr-student-01',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@dtu.ac.in',
    phone: '+91 98765 43210',
    role: 'student',
    rollNumber: '2023/CS/104',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    foodPreference: 'Vegetarian',
    favourites: ['canteen-1', 'canteen-2']
  },
  staff: {
    id: 'usr-staff-01',
    name: 'Dr. Meenakshi Sundaram',
    email: 'meenakshi.s@dtu.ac.in',
    phone: '+91 98111 22334',
    role: 'staff',
    employeeId: 'EMP-DTU-4412',
    department: 'Electronics & Communication',
    designation: 'Associate Professor',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    foodPreference: 'Vegetarian',
    favourites: ['canteen-2']
  },
  guest: {
    id: 'usr-guest-01',
    name: 'Guest Campus Visitor',
    email: 'visitor@guest.campus.in',
    phone: '+91 98000 00000',
    role: 'guest',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    foodPreference: 'All',
    favourites: []
  },
  parent: {
    id: 'usr-parent-01',
    name: 'Sunita Sharma (Parent)',
    email: 'parent.visitor@campus.in',
    phone: '+91 98222 33445',
    role: 'guest',
    userCategory: 'Parent',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    foodPreference: 'Vegetarian',
    favourites: ['canteen-1']
  },
  canteen_owner: {
    id: 'usr-owner-01',
    name: 'Ramesh Sharma',
    email: 'ramesh.nescafe@campus.in',
    phone: '+91 98712 34567',
    role: 'canteen_owner',
    canteenId: 'canteen-1',
    canteenName: 'Nescafe & Central Cafeteria',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  university_admin: {
    id: 'usr-uni-admin-01',
    name: 'Prof. Alok Gupta',
    email: 'campus.admin@dtu.ac.in',
    phone: '+91 98100 99887',
    role: 'university_admin',
    designation: 'Dean of Student Affairs',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  platform_admin: {
    id: 'usr-platform-01',
    name: 'Aditi Deshmukh',
    email: 'superadmin@whereismycanteen.in',
    phone: '+91 99999 88888',
    role: 'platform_admin',
    designation: 'Central Operations Head',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wmc_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USERS.student;
      }
    }
    return DEFAULT_USERS.student; // Default as active student for rich demo
  });

  const [favourites, setFavourites] = useState(() => {
    const saved = localStorage.getItem('wmc_favourites');
    return saved ? JSON.parse(saved) : ['canteen-1', 'canteen-2'];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('wmc_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wmc_current_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('wmc_favourites', JSON.stringify(favourites));
  }, [favourites]);

  const login = (role = 'student', customData = {}) => {
    const baseUser = DEFAULT_USERS[role] || DEFAULT_USERS.student;
    const finalUser = { ...baseUser, ...customData };
    setUser(finalUser);
    return finalUser;
  };

  const logout = () => {
    setUser(null);
  };

  const register = (data) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: data.name || 'Campus Student',
      email: data.email,
      phone: data.phone || '+91 98765 00000',
      role: data.role || 'student',
      rollNumber: data.rollNumber || '2024/GEN/001',
      universityId: data.universityId || 'dtu-delhi',
      campusId: data.campusId || 'dtu-main',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      foodPreference: 'Vegetarian'
    };
    setUser(newUser);
    return newUser;
  };

  const toggleFavourite = (canteenId) => {
    setFavourites(prev => 
      prev.includes(canteenId) 
        ? prev.filter(id => id !== canteenId) 
        : [...prev, canteenId]
    );
  };

  const isFavourite = (canteenId) => favourites.includes(canteenId);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
        login,
        logout,
        register,
        favourites,
        toggleFavourite,
        isFavourite,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
