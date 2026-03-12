import { create } from "zustand";
import {
    CreateTaskPayload,
    Task,
    taskApi,
    TaskStatus,
} from "../services/taskService";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  fetchMyTasks: () => Promise<void>;
  createTask: (data: CreateTaskPayload) => Promise<void>;
  updateTaskStatus: (
    id: string,
    status: TaskStatus,
    cancelReason?: string,
  ) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await taskApi.getAllTasks();
      set({ tasks: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch tasks",
        isLoading: false,
      });
    }
  },

  fetchMyTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await taskApi.getMyTasks();
      set({ tasks: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch your tasks",
        isLoading: false,
      });
    }
  },

  createTask: async (data: CreateTaskPayload) => {
    set({ isLoading: true, error: null });
    try {
      await taskApi.createTask(data);
      await get().fetchTasks(); // Refresh list
    } catch (error: any) {
      set({
        error: error.message || "Failed to create task",
        isLoading: false,
      });
      throw error;
    }
  },

  updateTaskStatus: async (
    id: string,
    status: TaskStatus,
    cancelReason?: string,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await taskApi.updateTaskStatus(id, status, cancelReason);
      await get().fetchTasks(); // Refresh list
    } catch (error: any) {
      set({
        error: error.message || "Failed to update task",
        isLoading: false,
      });
      throw error;
    }
  },
}));
