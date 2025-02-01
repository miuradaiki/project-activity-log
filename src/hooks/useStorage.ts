import { useEffect, useState } from 'react';
import { Project, TimeEntry } from '../types';

export const useStorage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [projects, timeEntries]);

  const loadData = async () => {
    try {
      const loadedProjects = await window.electronAPI.loadProjects();
      const loadedTimeEntries = await window.electronAPI.loadTimeEntries();
      
      console.log('Loaded Projects:', loadedProjects);
      console.log('Loaded Time Entries:', loadedTimeEntries);
      
      if (!Array.isArray(loadedProjects)) {
        console.error('Loaded projects is not an array:', loadedProjects);
        setProjects([]);
      } else {
        setProjects(loadedProjects);
      }

      if (!Array.isArray(loadedTimeEntries)) {
        console.error('Loaded time entries is not an array:', loadedTimeEntries);
        setTimeEntries([]);
      } else {
        setTimeEntries(loadedTimeEntries);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setProjects([]);
      setTimeEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async () => {
    try {
      console.log('Saving Projects:', projects);
      console.log('Saving Time Entries:', timeEntries);
      
      await window.electronAPI.saveProjects(projects);
      await window.electronAPI.saveTimeEntries(timeEntries);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return {
    projects,
    setProjects,
    timeEntries,
    setTimeEntries,
    isLoading,
  };
};