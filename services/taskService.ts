import api from "./api";

export type TaskStatus = "assigned" | "in-progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
export type TaskType =
  | "inventory"
  | "procurement"
  | "expiry"
  | "stock-count"
  | "general";

export interface Task {
  id: string; // The backend formatTask() maps _id to id
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  createdByName: string;
  dueDate: string;
  status: TaskStatus;
  priority?: TaskPriority;
  taskType?: TaskType;
  cancelReason?: string;
  createdAt: string;
  linkedRecordType?: string;
  linkedRecordId?: string;
  linkedRecordName?: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority?: TaskPriority;
  taskType?: TaskType;
}

export const taskApi = {
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>("/tasks");
    return response.data;
  },

  getMyTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>("/tasks/my-tasks");
    return response.data;
  },

  createTask: async (data: CreateTaskPayload): Promise<Task> => {
    const response = await api.post<Task>("/tasks", data);
    return response.data;
  },

  updateTaskStatus: async (
    id: string,
    status: TaskStatus,
    cancelReason?: string,
  ): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/status`, {
      status,
      cancelReason,
    });
    return response.data;
  },
};
