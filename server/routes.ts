import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertFamilySchema, 
  insertFamilyMemberSchema,
  insertActivitySchema,
  insertGoalSchema,
  insertScheduleEventSchema,
  insertEventAssigneeSchema,
  insertHealthTipSchema,
  insertActivityStatSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler for Zod validation
  const validateRequest = (schema: any, data: any) => {
    try {
      return { data: schema.parse(data), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return { data: null, error: error.format() };
      }
      return { data: null, error };
    }
  };

  // User endpoints
  app.post("/api/users", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertUserSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to create user", error: err });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to get user", error: err });
    }
  });

  app.get("/api/users", async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Failed to get users", error: err });
    }
  });

  // Family endpoints
  app.post("/api/families", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertFamilySchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const family = await storage.createFamily(data);
      res.status(201).json(family);
    } catch (err) {
      res.status(500).json({ message: "Failed to create family", error: err });
    }
  });

  app.get("/api/families/:id", async (req: Request, res: Response) => {
    try {
      const family = await storage.getFamilyById(Number(req.params.id));
      if (!family) {
        return res.status(404).json({ message: "Family not found" });
      }
      res.json(family);
    } catch (err) {
      res.status(500).json({ message: "Failed to get family", error: err });
    }
  });

  app.get("/api/users/:userId/families", async (req: Request, res: Response) => {
    try {
      const families = await storage.getFamiliesByUser(Number(req.params.userId));
      res.json(families);
    } catch (err) {
      res.status(500).json({ message: "Failed to get user's families", error: err });
    }
  });

  app.post("/api/family-members", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertFamilyMemberSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const member = await storage.addFamilyMember(data);
      res.status(201).json(member);
    } catch (err) {
      res.status(500).json({ message: "Failed to add family member", error: err });
    }
  });

  app.get("/api/families/:familyId/members", async (req: Request, res: Response) => {
    try {
      const members = await storage.getFamilyMembers(Number(req.params.familyId));
      res.json(members);
    } catch (err) {
      res.status(500).json({ message: "Failed to get family members", error: err });
    }
  });

  // Activity endpoints
  app.post("/api/activities", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertActivitySchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const activity = await storage.createActivity(data);
      res.status(201).json(activity);
    } catch (err) {
      res.status(500).json({ message: "Failed to create activity", error: err });
    }
  });

  app.get("/api/users/:userId/activities", async (req: Request, res: Response) => {
    try {
      const activities = await storage.getActivitiesByUser(Number(req.params.userId));
      res.json(activities);
    } catch (err) {
      res.status(500).json({ message: "Failed to get user activities", error: err });
    }
  });

  app.get("/api/users/:userId/recent-activities", async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 5;
    try {
      const activities = await storage.getRecentActivitiesByUser(Number(req.params.userId), limit);
      res.json(activities);
    } catch (err) {
      res.status(500).json({ message: "Failed to get recent activities", error: err });
    }
  });

  // Goal endpoints
  app.post("/api/goals", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertGoalSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const goal = await storage.createGoal(data);
      res.status(201).json(goal);
    } catch (err) {
      res.status(500).json({ message: "Failed to create goal", error: err });
    }
  });

  app.get("/api/users/:userId/goals", async (req: Request, res: Response) => {
    try {
      const goals = await storage.getGoalsByUser(Number(req.params.userId));
      res.json(goals);
    } catch (err) {
      res.status(500).json({ message: "Failed to get user goals", error: err });
    }
  });

  app.patch("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const updatedGoal = await storage.updateGoal(Number(req.params.id), req.body);
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(updatedGoal);
    } catch (err) {
      res.status(500).json({ message: "Failed to update goal", error: err });
    }
  });

  // Schedule endpoints
  app.post("/api/schedule-events", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertScheduleEventSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const event = await storage.createScheduleEvent(data);
      res.status(201).json(event);
    } catch (err) {
      res.status(500).json({ message: "Failed to create schedule event", error: err });
    }
  });

  app.get("/api/schedule-events", async (req: Request, res: Response) => {
    const dateParam = req.query.date as string;
    let date;
    
    if (dateParam) {
      date = new Date(dateParam);
    } else {
      date = new Date();
    }

    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    try {
      const events = await storage.getScheduleEventsByDate(date);
      res.json(events);
    } catch (err) {
      res.status(500).json({ message: "Failed to get schedule events", error: err });
    }
  });

  app.post("/api/event-assignees", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertEventAssigneeSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const assignee = await storage.assignEventToUser(data);
      res.status(201).json(assignee);
    } catch (err) {
      res.status(500).json({ message: "Failed to assign event to user", error: err });
    }
  });

  app.get("/api/schedule-events/:eventId/assignees", async (req: Request, res: Response) => {
    try {
      const assignees = await storage.getEventAssignees(Number(req.params.eventId));
      res.json(assignees);
    } catch (err) {
      res.status(500).json({ message: "Failed to get event assignees", error: err });
    }
  });

  app.get("/api/users/:userId/schedule", async (req: Request, res: Response) => {
    const dateParam = req.query.date as string;
    let date;
    
    if (dateParam) {
      date = new Date(dateParam);
    } else {
      date = new Date();
    }

    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    try {
      const events = await storage.getScheduleEventsForUser(Number(req.params.userId), date);
      res.json(events);
    } catch (err) {
      res.status(500).json({ message: "Failed to get user schedule", error: err });
    }
  });

  // Health tips endpoints
  app.post("/api/health-tips", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertHealthTipSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const tip = await storage.createHealthTip(data);
      res.status(201).json(tip);
    } catch (err) {
      res.status(500).json({ message: "Failed to create health tip", error: err });
    }
  });

  app.get("/api/health-tips/random", async (_req: Request, res: Response) => {
    try {
      const tip = await storage.getRandomHealthTip();
      if (!tip) {
        return res.status(404).json({ message: "No health tips found" });
      }
      res.json(tip);
    } catch (err) {
      res.status(500).json({ message: "Failed to get random health tip", error: err });
    }
  });

  app.get("/api/health-tips", async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 5;
    try {
      const tips = await storage.getHealthTips(limit);
      res.json(tips);
    } catch (err) {
      res.status(500).json({ message: "Failed to get health tips", error: err });
    }
  });

  // Activity stats endpoints
  app.post("/api/activity-stats", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertActivityStatSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const stat = await storage.createActivityStat(data);
      res.status(201).json(stat);
    } catch (err) {
      res.status(500).json({ message: "Failed to create activity stat", error: err });
    }
  });

  app.get("/api/users/:userId/activity-stats", async (req: Request, res: Response) => {
    const days = Number(req.query.days) || 7;
    try {
      const stats = await storage.getActivityStatsByUser(Number(req.params.userId), days);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to get user activity stats", error: err });
    }
  });

  app.get("/api/users/:userId/daily-progress", async (req: Request, res: Response) => {
    try {
      const progress = await storage.getDailyUserProgress(Number(req.params.userId));
      res.json({ progress });
    } catch (err) {
      res.status(500).json({ message: "Failed to get user daily progress", error: err });
    }
  });

  app.get("/api/families/:familyId/progress", async (req: Request, res: Response) => {
    try {
      const progress = await storage.getFamilyProgress(Number(req.params.familyId));
      res.json(progress);
    } catch (err) {
      res.status(500).json({ message: "Failed to get family progress", error: err });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
