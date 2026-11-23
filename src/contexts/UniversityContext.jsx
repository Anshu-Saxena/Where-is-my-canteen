import React, { createContext, useContext, useState, useEffect } from 'react';
import { UNIVERSITIES } from '../data/mockData';

const UniversityContext = createContext();

export function UniversityProvider({ children }) {
  const [selectedUniversity, setSelectedUniversity] = useState(() => {
    const saved = localStorage.getItem('wmc_university');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = UNIVERSITIES.find(u => u.id === parsed.id);
        if (match) return match;
      } catch (e) { /* fallback */ }
    }
    return UNIVERSITIES[0]; // DTU Delhi
  });

  const [selectedCampus, setSelectedCampus] = useState(() => {
    const saved = localStorage.getItem('wmc_campus');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { /* fallback */ }
    }
    return UNIVERSITIES[0].campuses[0]; // Main Campus, Rohini
  });

  const [recentlyVisited, setRecentlyVisited] = useState(() => {
    const saved = localStorage.getItem('wmc_recent_campuses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { /* fallback */ }
    }
    return [
      {
        universityId: 'dtu-delhi',
        universityName: 'Delhi Technological University (DTU)',
        campusId: 'dtu-main',
        campusName: 'Main Campus, Rohini',
        city: 'New Delhi'
      },
      {
        universityId: 'iit-bombay',
        universityName: 'IIT Bombay',
        campusId: 'iitb-powai',
        campusName: 'Powai Main Campus',
        city: 'Mumbai'
      }
    ];
  });

  useEffect(() => {
    if (selectedUniversity) {
      localStorage.setItem('wmc_university', JSON.stringify(selectedUniversity));
    }
  }, [selectedUniversity]);

  useEffect(() => {
    if (selectedCampus) {
      localStorage.setItem('wmc_campus', JSON.stringify(selectedCampus));
    }
  }, [selectedCampus]);

  useEffect(() => {
    localStorage.setItem('wmc_recent_campuses', JSON.stringify(recentlyVisited));
  }, [recentlyVisited]);

  const selectUniversityAndCampus = (university, campus) => {
    setSelectedUniversity(university);
    setSelectedCampus(campus);

    // Update recently visited
    setRecentlyVisited(prev => {
      const filtered = prev.filter(item => !(item.universityId === university.id && item.campusId === campus.id));
      return [
        {
          universityId: university.id,
          universityName: university.name,
          campusId: campus.id,
          campusName: campus.name,
          city: university.city
        },
        ...filtered.slice(0, 4)
      ];
    });
  };

  return (
    <UniversityContext.Provider
      value={{
        selectedUniversity,
        selectedCampus,
        selectUniversityAndCampus,
        setSelectedCampus,
        setSelectedUniversity,
        recentlyVisited,
        universities: UNIVERSITIES
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversity() {
  const context = useContext(UniversityContext);
  if (!context) throw new Error('useUniversity must be used within UniversityProvider');
  return context;
}
