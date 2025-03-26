import { 
  users, type User, type InsertUser,
  families, type Family, type InsertFamily,
  familyMembers, type FamilyMember, type InsertFamilyMember,
  activities, type Activity, type InsertActivity,
  goals, type Goal, type InsertGoal,
  scheduleEvents, type ScheduleEvent, type InsertScheduleEvent,
  eventAssignees, type EventAssignee, type InsertEventAssignee,
  healthTips, type HealthTip, type InsertHealthTip,
  activityStats, type ActivityStat, type InsertActivityStat
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Family operations
  createFamily(family: InsertFamily): Promise<Family>;
  getFamilyById(id: number): Promise<Family | undefined>;
  getFamiliesByUser(userId: number): Promise<Family[]>;
  addFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  getFamilyMembers(familyId: number): Promise<User[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;
  getRecentActivitiesByUser(userId: number, limit: number): Promise<Activity[]>;
  
  // Goal operations
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoalsByUser(userId: number): Promise<Goal[]>;
  updateGoal(id: number, goal: Partial<Goal>): Promise<Goal | undefined>;
  
  // Schedule operations
  createScheduleEvent(event: InsertScheduleEvent): Promise<ScheduleEvent>;
  getScheduleEventsByDate(date: Date): Promise<ScheduleEvent[]>;
  assignEventToUser(assignee: InsertEventAssignee): Promise<EventAssignee>;
  getEventAssignees(eventId: number): Promise<User[]>;
  getScheduleEventsForUser(userId: number, date: Date): Promise<ScheduleEvent[]>;
  
  // Health tips operations
  createHealthTip(tip: InsertHealthTip): Promise<HealthTip>;
  getRandomHealthTip(): Promise<HealthTip | undefined>;
  getHealthTips(limit: number): Promise<HealthTip[]>;
  
  // Stats operations
  createActivityStat(stat: InsertActivityStat): Promise<ActivityStat>;
  getActivityStatsByUser(userId: number, days: number): Promise<ActivityStat[]>;
  getDailyUserProgress(userId: number): Promise<number>;
  getFamilyProgress(familyId: number): Promise<{userId: number, progress: number}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private families: Map<number, Family>;
  private familyMembers: Map<number, FamilyMember>;
  private activities: Map<number, Activity>;
  private goals: Map<number, Goal>;
  private scheduleEvents: Map<number, ScheduleEvent>;
  private eventAssignees: Map<number, EventAssignee>;
  private healthTips: Map<number, HealthTip>;
  private activityStats: Map<number, ActivityStat>;

  currentUserId: number = 1;
  currentFamilyId: number = 1;
  currentFamilyMemberId: number = 1;
  currentActivityId: number = 1;
  currentGoalId: number = 1;
  currentScheduleEventId: number = 1;
  currentEventAssigneeId: number = 1;
  currentHealthTipId: number = 1;
  currentActivityStatId: number = 1;

  constructor() {
    this.users = new Map();
    this.families = new Map();
    this.familyMembers = new Map();
    this.activities = new Map();
    this.goals = new Map();
    this.scheduleEvents = new Map();
    this.eventAssignees = new Map();
    this.healthTips = new Map();
    this.activityStats = new Map();
    
    // Initialize with some sample health tips
    this.initializeHealthTips();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Family operations
  async createFamily(family: InsertFamily): Promise<Family> {
    const id = this.currentFamilyId++;
    const newFamily: Family = { ...family, id };
    this.families.set(id, newFamily);
    return newFamily;
  }

  async getFamilyById(id: number): Promise<Family | undefined> {
    return this.families.get(id);
  }

  async getFamiliesByUser(userId: number): Promise<Family[]> {
    // Get families where user is a creator
    const ownedFamilies = Array.from(this.families.values()).filter(
      family => family.createdBy === userId
    );
    
    // Get families where user is a member
    const memberFamilyIds = Array.from(this.familyMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.familyId);
    
    const memberFamilies = Array.from(this.families.values()).filter(
      family => memberFamilyIds.includes(family.id)
    );
    
    // Combine both arrays and remove duplicates
    return [...ownedFamilies, ...memberFamilies].filter(
      (family, index, self) => 
        index === self.findIndex(f => f.id === family.id)
    );
  }

  async addFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const id = this.currentFamilyMemberId++;
    const newMember: FamilyMember = { ...member, id };
    this.familyMembers.set(id, newMember);
    return newMember;
  }

  async getFamilyMembers(familyId: number): Promise<User[]> {
    // Find all family member records for this family
    const memberRecords = Array.from(this.familyMembers.values()).filter(
      member => member.familyId === familyId
    );
    
    // Get all user objects for these members
    const members = memberRecords.map(record => this.users.get(record.userId))
      .filter((user): user is User => user !== undefined);
    
    return members;
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const newActivity: Activity = { ...activity, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      activity => activity.userId === userId
    );
  }

  async getRecentActivitiesByUser(userId: number, limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // Goal operations
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId++;
    const newGoal: Goal = { ...goal, id };
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async getGoalsByUser(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      goal => goal.userId === userId
    );
  }

  async updateGoal(id: number, goalUpdate: Partial<Goal>): Promise<Goal | undefined> {
    const existingGoal = this.goals.get(id);
    if (!existingGoal) return undefined;
    
    const updatedGoal = { ...existingGoal, ...goalUpdate };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  // Schedule operations
  async createScheduleEvent(event: InsertScheduleEvent): Promise<ScheduleEvent> {
    const id = this.currentScheduleEventId++;
    const newEvent: ScheduleEvent = { ...event, id };
    this.scheduleEvents.set(id, newEvent);
    return newEvent;
  }

  async getScheduleEventsByDate(date: Date): Promise<ScheduleEvent[]> {
    const dateStart = new Date(date.setHours(0, 0, 0, 0));
    const dateEnd = new Date(date.setHours(23, 59, 59, 999));
    
    return Array.from(this.scheduleEvents.values()).filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= dateStart && eventDate <= dateEnd;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async assignEventToUser(assignee: InsertEventAssignee): Promise<EventAssignee> {
    const id = this.currentEventAssigneeId++;
    const newAssignee: EventAssignee = { ...assignee, id };
    this.eventAssignees.set(id, newAssignee);
    return newAssignee;
  }

  async getEventAssignees(eventId: number): Promise<User[]> {
    // Find all assignee records for this event
    const assigneeRecords = Array.from(this.eventAssignees.values()).filter(
      assignee => assignee.eventId === eventId
    );
    
    // Get all user objects for these assignees
    const assignees = assigneeRecords.map(record => this.users.get(record.userId))
      .filter((user): user is User => user !== undefined);
    
    return assignees;
  }

  async getScheduleEventsForUser(userId: number, date: Date): Promise<ScheduleEvent[]> {
    // Get all events for the given date
    const eventsForDate = await this.getScheduleEventsByDate(date);
    
    // Filter for events where this user is an assignee
    const assigneeEvents = await Promise.all(eventsForDate.map(async event => {
      const assignees = await this.getEventAssignees(event.id);
      return assignees.some(assignee => assignee.id === userId) ? event : null;
    }));
    
    return assigneeEvents.filter((event): event is ScheduleEvent => event !== null);
  }

  // Health tips operations
  async createHealthTip(tip: InsertHealthTip): Promise<HealthTip> {
    const id = this.currentHealthTipId++;
    const newTip: HealthTip = { ...tip, id, createdAt: new Date() };
    this.healthTips.set(id, newTip);
    return newTip;
  }

  async getRandomHealthTip(): Promise<HealthTip | undefined> {
    const tips = Array.from(this.healthTips.values());
    if (tips.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  }

  async getHealthTips(limit: number): Promise<HealthTip[]> {
    return Array.from(this.healthTips.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Stats operations
  async createActivityStat(stat: InsertActivityStat): Promise<ActivityStat> {
    const id = this.currentActivityStatId++;
    const newStat: ActivityStat = { ...stat, id };
    this.activityStats.set(id, newStat);
    return newStat;
  }

  async getActivityStatsByUser(userId: number, days: number): Promise<ActivityStat[]> {
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - days));
    
    return Array.from(this.activityStats.values()).filter(
      stat => stat.userId === userId && new Date(stat.date) >= cutoffDate
    );
  }

  async getDailyUserProgress(userId: number): Promise<number> {
    // This is a simplified calculation - in a real app would be more complex
    // Calculate based on goals completed / total goals, or actual activity / target activity
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const goals = Array.from(this.goals.values()).filter(
      goal => goal.userId === userId && (!goal.dueDate || new Date(goal.dueDate) >= today)
    );
    
    if (goals.length === 0) return 0;
    
    // Calculate average progress across all goals
    const totalProgress = goals.reduce((sum, goal) => {
      const progress = Math.min(goal.currentValue / goal.targetValue, 1);
      return sum + progress;
    }, 0);
    
    return Math.round((totalProgress / goals.length) * 100);
  }

  async getFamilyProgress(familyId: number): Promise<{userId: number, progress: number}[]> {
    // Get all users in this family
    const familyUsers = await this.getFamilyMembers(familyId);
    
    // Calculate progress for each family member
    const progressPromises = familyUsers.map(async user => {
      const progress = await this.getDailyUserProgress(user.id);
      return { userId: user.id, progress };
    });
    
    return Promise.all(progressPromises);
  }

  // Utility method to initialize some health tips
  private initializeHealthTips() {
    const sampleTips = [
      {
        title: "Family Fitness Tip",
        content: "Try a family hike this weekend! Studies show that outdoor activities improve mood and increase vitamin D levels.",
        type: "fitness",
        icon: "lightbulb"
      },
      {
        title: "Nutrition Tip",
        content: "Include colorful vegetables in every meal. Different colors provide different nutrients essential for health.",
        type: "nutrition",
        icon: "restaurant"
      },
      {
        title: "Mental Health",
        content: "Practice mindfulness as a family. Just 5 minutes of quiet focus can reduce stress and improve concentration.",
        type: "general",
        icon: "self_improvement"
      }
    ];
    
    sampleTips.forEach(tip => {
      const id = this.currentHealthTipId++;
      this.healthTips.set(id, { 
        ...tip, 
        id, 
        createdAt: new Date() 
      });
    });
  }
}

export const storage = new MemStorage();
