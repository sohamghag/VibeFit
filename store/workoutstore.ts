import { Exercise } from "@/sanity/sanity.types";
import { create } from "zustand";

export const useWorkoutStore = create((set) => ({
  exercises: [],

  addExercise: (exerciseData: Exercise) =>
    set((state: any) => ({
      exercises: [...state.exercises, exerciseData],
    })),

  resetWorkout: () => set({ exercises: [] }),
}));
