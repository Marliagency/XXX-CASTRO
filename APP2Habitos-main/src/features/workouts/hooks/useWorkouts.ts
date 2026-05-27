import { useEffect } from 'react';
import { useWorkoutsStore } from '../store/workoutsStore';

export function useWorkouts() {
  const store = useWorkoutsStore();

  useEffect(() => {
    if (!store.loaded) store.loadFromStorage();
  }, [store.loaded, store.loadFromStorage]);

  return store;
}
