import { tool } from "ai";
import { z } from "zod";
import {
  completeTask,
  createTask,
  getTasksByBusinessId,
  updateTask,
  cancelTask,
} from "@/lib/db/queries";

export function taskTools(businessId: string) {
  return {
    createTask: tool({
      description:
        "Create a new task to track work that needs to be done. Use this when a client needs a follow-up, a proposal needs to be sent, a meeting needs to be scheduled, or any action item comes up during conversation.",
      parameters: z.object({
        title: z.string().describe("Short task title"),
        description: z
          .string()
          .optional()
          .describe("Optional detailed description"),
        priority: z
          .enum(["low", "medium", "high", "urgent"])
          .default("medium")
          .describe("Task priority level"),
        leadId: z
          .string()
          .uuid()
          .optional()
          .describe("Link to a lead if this task is for a specific client"),
      }),
      execute: async (params) => {
        const task = await createTask({
          businessId,
          title: params.title,
          description: params.description || undefined,
          priority: params.priority,
          leadId: params.leadId || undefined,
          createdBy: "ai",
        });
        return {
          ok: true,
          taskId: task.id,
          message: `Task created: "${task.title}" (priority: ${task.priority})`,
        };
      },
    }),

    completeTask: tool({
      description:
        "Mark a task as completed. Use this after you have finished doing the work described in a task (e.g., after sending a proposal, confirming a meeting, or following up with a client).",
      parameters: z.object({
        taskId: z.string().uuid().describe("ID of the task to complete"),
      }),
      execute: async (params) => {
        const task = await completeTask(params.taskId);
        return {
          ok: true,
          message: `Task "${task.title}" marked as completed.`,
        };
      },
    }),

    listTasks: tool({
      description:
        "List tasks for the current business. Use this to check what needs to be done, find pending follow-ups, or review upcoming work.",
      parameters: z.object({
        status: z
          .enum(["pending", "in_progress", "completed", "cancelled"])
          .optional()
          .describe("Filter by task status"),
        leadId: z
          .string()
          .uuid()
          .optional()
          .describe("Filter tasks for a specific client/lead"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Max tasks to return"),
      }),
      execute: async (params) => {
        const tasks = await getTasksByBusinessId(businessId, {
          status: params.status,
          leadId: params.leadId,
          limit: params.limit,
        });
        if (tasks.length === 0) {
          return { ok: true, tasks: [], message: "No tasks found." };
        }
        return {
          ok: true,
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            description: t.description,
            dueDate: t.dueDate,
            createdAt: t.createdAt,
          })),
          message: `Found ${tasks.length} task(s).`,
        };
      },
    }),

    updateTask: tool({
      description:
        "Update a task's details, priority, or status. Use this when a task needs to be reprioritized, rescheduled, or given more context.",
      parameters: z.object({
        taskId: z.string().uuid().describe("ID of the task to update"),
        title: z
          .string()
          .optional()
          .describe("New title (if changing)"),
        description: z
          .string()
          .optional()
          .describe("New description (if changing)"),
        priority: z
          .enum(["low", "medium", "high", "urgent"])
          .optional()
          .describe("New priority (if changing)"),
        status: z
          .enum(["pending", "in_progress", "completed", "cancelled"])
          .optional()
          .describe("New status (if changing)"),
      }),
      execute: async (params) => {
        const updates: Record<string, unknown> = {};
        if (params.title !== undefined) updates.title = params.title;
        if (params.description !== undefined)
          updates.description = params.description;
        if (params.priority !== undefined) updates.priority = params.priority;
        if (params.status !== undefined) {
          if (params.status === "completed") {
            await completeTask(params.taskId);
            return {
              ok: true,
              message: `Task marked as completed.`,
            };
          }
          if (params.status === "cancelled") {
            await cancelTask(params.taskId);
            return {
              ok: true,
              message: `Task cancelled.`,
            };
          }
          updates.status = params.status;
        }

        const task = await updateTask(params.taskId, updates);
        return {
          ok: true,
          message: `Task "${task.title}" updated.`,
        };
      },
    }),
  };
}
