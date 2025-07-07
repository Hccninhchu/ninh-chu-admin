import { 
  users, procedures, applications, feedback, contacts,
  type User, type InsertUser,
  type Procedure, type InsertProcedure,
  type Application, type InsertApplication,
  type Feedback, type InsertFeedback,
  type Contact, type InsertContact
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProcedures(): Promise<Procedure[]>;
  getProcedure(id: number): Promise<Procedure | undefined>;
  createProcedure(procedure: InsertProcedure): Promise<Procedure>;
  updateProcedure(id: number, procedure: Partial<InsertProcedure>): Promise<Procedure>;
  deleteProcedure(id: number): Promise<void>;
  updateProcedureQR(id: number, qrCode: string): Promise<void>;
  
  getApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationByCode(code: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<void>;
  getUserApplications(userId: number): Promise<Application[]>;
  
  getFeedbacks(): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackStats(): Promise<any>;
  
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  
  getStats(): Promise<any>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProcedures(): Promise<Procedure[]> {
    return await db.select().from(procedures).where(eq(procedures.isActive, true)).orderBy(procedures.category, procedures.name);
  }

  async getProcedure(id: number): Promise<Procedure | undefined> {
    const [procedure] = await db.select().from(procedures).where(eq(procedures.id, id));
    return procedure || undefined;
  }

  async createProcedure(procedure: InsertProcedure): Promise<Procedure> {
    const [newProcedure] = await db
      .insert(procedures)
      .values({
        ...procedure,
        requirements: procedure.requirements || []
      })
      .returning();
    return newProcedure;
  }

  async updateProcedure(id: number, procedure: Partial<InsertProcedure>): Promise<Procedure> {
    const updateData: any = { ...procedure, updatedAt: new Date() };
    if (updateData.requirements && Array.isArray(updateData.requirements)) {
      updateData.requirements = updateData.requirements;
    }
    const [updated] = await db
      .update(procedures)
      .set(updateData)
      .where(eq(procedures.id, id))
      .returning();
    return updated;
  }

  async deleteProcedure(id: number): Promise<void> {
    await db.update(procedures).set({ isActive: false }).where(eq(procedures.id, id));
  }

  async updateProcedureQR(id: number, qrCode: string): Promise<void> {
    await db.update(procedures).set({ qrCode }).where(eq(procedures.id, id));
  }

  async getApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getApplicationByCode(code: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.applicationCode, code));
    return application || undefined;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const applicationCode = `HS${Date.now().toString().slice(-6)}`;
    const [newApplication] = await db
      .insert(applications)
      .values({ 
        ...application, 
        applicationCode,
        documents: application.documents || []
      })
      .returning();
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<void> {
    await db.update(applications).set({ status, updatedAt: new Date() }).where(eq(applications.id, id));
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.createdAt));
  }

  async getFeedbacks(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return newFeedback;
  }

  async getFeedbackStats(): Promise<any> {
    const stats = await db.select({
      rating: feedback.rating,
      count: sql<number>`count(*)`.as('count')
    })
    .from(feedback)
    .groupBy(feedback.rating);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const average = stats.reduce((sum, stat) => sum + (stat.rating * stat.count), 0) / total;

    return {
      average: Math.round(average * 10) / 10,
      total,
      ratings: stats.reduce((acc, stat) => {
        acc[`rating${stat.rating}`] = Math.round((stat.count / total) * 100);
        return acc;
      }, {} as any)
    };
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getStats(): Promise<any> {
    const [proceduresCount] = await db.select({ count: sql<number>`count(*)` }).from(procedures).where(eq(procedures.isActive, true));
    const [applicationsCount] = await db.select({ count: sql<number>`count(*)` }).from(applications);
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(applications).where(eq(applications.status, 'pending'));
    const [processingCount] = await db.select({ count: sql<number>`count(*)` }).from(applications).where(eq(applications.status, 'processing'));
    const [completedCount] = await db.select({ count: sql<number>`count(*)` }).from(applications).where(eq(applications.status, 'completed'));
    const [feedbackCount] = await db.select({ count: sql<number>`count(*)` }).from(feedback);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayApplications] = await db.select({ count: sql<number>`count(*)` }).from(applications)
      .where(sql`${applications.createdAt} >= ${todayStart}`);

    return {
      totalProcedures: proceduresCount.count,
      totalApplications: applicationsCount.count,
      pendingApplications: pendingCount.count,
      processingApplications: processingCount.count,
      completedApplications: completedCount.count,
      todayApplications: todayApplications.count,
      totalFeedback: feedbackCount.count
    };
  }
}

export const storage = new DatabaseStorage();
