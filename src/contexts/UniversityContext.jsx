import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { universityService } from '../services/api';

const UniversityContext = createContext();

function readStoredId(key) {
  const saved = localStorage.getItem(key);
  if (!saved) return '';
  try {
    const parsed = JSON.parse(saved);
    return typeof parsed === 'string' ? parsed : parsed?.id || '';
  } catch {
    return saved;
  }
}

function readRecentSelections() {
  const saved = localStorage.getItem('wmc_recent_campuses');
  if (!saved) return [];
  try {
    return JSON.parse(saved)
      .filter(item => item?.universityId && item?.campusId)
      .map(item => ({ universityId: item.universityId, campusId: item.campusId }));
  } catch {
    return [];
  }
}

export function UniversityProvider({ children }) {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState(() => readStoredId('wmc_university'));
  const [selectedCampusId, setSelectedCampusId] = useState(() => readStoredId('wmc_campus'));
  const [selectedCanteen, setSelectedCanteen] = useState(() => {
    try {
      const saved = localStorage.getItem('wmc_selected_canteen');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [recentSelectionIds, setRecentSelectionIds] = useState(readRecentSelections);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const refreshUniversities = useCallback(async () => {
    try {
      const result = await universityService.getUniversities();
      setUniversities(result);
      setLoadError('');
      return result;
    } catch (error) {
      setLoadError(error.message);
      return [];
    }
  }, []);

  useEffect(() => {
    let active = true;
    universityService.getUniversities()
      .then(result => {
        if (active) setUniversities(result);
      })
      .catch(error => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedUniversity = universities.find(university => university.id === selectedUniversityId)
    || universities[0]
    || null;
  const selectedCampus = selectedUniversity?.campuses.find(campus => campus.id === selectedCampusId)
    || selectedUniversity?.campuses[0]
    || null;
  const recentlyVisited = recentSelectionIds.map(selection => {
    const university = universities.find(item => item.id === selection.universityId);
    const campus = university?.campuses.find(item => item.id === selection.campusId);
    if (!university || !campus) return null;
    return {
      universityId: university.id,
      universityName: university.name,
      campusId: campus.id,
      campusName: campus.name,
      city: university.city
    };
  }).filter(Boolean);

  useEffect(() => {
    if (!selectedUniversity || !selectedCampus) return;
    if (selectedUniversityId !== selectedUniversity.id) {
      setSelectedUniversityId(selectedUniversity.id);
    }
    if (selectedCampusId !== selectedCampus.id) {
      setSelectedCampusId(selectedCampus.id);
    }
    localStorage.setItem('wmc_university', JSON.stringify(selectedUniversity.id));
    localStorage.setItem('wmc_campus', JSON.stringify(selectedCampus.id));
  }, [selectedUniversity, selectedCampus, selectedUniversityId, selectedCampusId]);

  useEffect(() => {
    localStorage.setItem('wmc_recent_campuses', JSON.stringify(recentSelectionIds));
  }, [recentSelectionIds]);

  const selectCanteen = useCallback(canteen => {
    setSelectedCanteen(canteen || null);
    if (canteen) {
      localStorage.setItem('wmc_selected_canteen', JSON.stringify(canteen));
    } else {
      localStorage.removeItem('wmc_selected_canteen');
    }
  }, []);

  const selectUniversityAndCampus = useCallback((university, campus) => {
    setSelectedUniversityId(university.id);
    setSelectedCampusId(campus.id);
    // Clear selected canteen if it belongs to a different campus
    setSelectedCanteen(prev => {
      if (prev && prev.campusId !== campus.id) {
        localStorage.removeItem('wmc_selected_canteen');
        return null;
      }
      return prev;
    });
    setRecentSelectionIds(previous => [
      { universityId: university.id, campusId: campus.id },
      ...previous.filter(item => item.universityId !== university.id || item.campusId !== campus.id)
    ].slice(0, 5));
  }, []);

  const setSelectedCampus = useCallback(campus => {
    if (campus?.id) {
      setSelectedCampusId(campus.id);
      setSelectedCanteen(prev => {
        if (prev && prev.campusId !== campus.id) {
          localStorage.removeItem('wmc_selected_canteen');
          return null;
        }
        return prev;
      });
    }
  }, []);

  const setSelectedUniversity = useCallback(university => {
    if (university?.id) {
      setSelectedUniversityId(university.id);
      const nextCampusId = university.campuses?.[0]?.id || '';
      setSelectedCampusId(nextCampusId);
      setSelectedCanteen(prev => {
        if (prev && prev.campusId !== nextCampusId) {
          localStorage.removeItem('wmc_selected_canteen');
          return null;
        }
        return prev;
      });
    }
  }, []);

  return (
    <UniversityContext.Provider
      value={{
        selectedUniversity,
        selectedCampus,
        selectedCanteen,
        selectCanteen,
        selectUniversityAndCampus,
        setSelectedCampus,
        setSelectedUniversity,
        refreshUniversities,
        recentlyVisited,
        universities,
        isLoading,
        loadError
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
