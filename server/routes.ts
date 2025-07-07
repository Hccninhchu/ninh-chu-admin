import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProcedureSchema, 
  insertApplicationSchema, 
  insertFeedbackSchema, 
  insertContactSchema 
} from "@shared/schema";
import QRCode from "qrcode";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Procedures routes
  app.get("/api/procedures", async (req, res) => {
    try {
      const procedures = await storage.getProcedures();
      res.json(procedures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch procedures" });
    }
  });

  app.get("/api/procedures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const procedure = await storage.getProcedure(id);
      if (!procedure) {
        return res.status(404).json({ message: "Procedure not found" });
      }
      res.json(procedure);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch procedure" });
    }
  });

  app.post("/api/procedures", requireAdmin, async (req, res) => {
    try {
      const procedureData = insertProcedureSchema.parse(req.body);
      const procedure = await storage.createProcedure(procedureData);
      
      // Generate QR code
      const qrData = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/procedure/${procedure.id}`;
      const qrCode = await QRCode.toDataURL(qrData);
      await storage.updateProcedureQR(procedure.id, qrCode);
      
      const updatedProcedure = await storage.getProcedure(procedure.id);
      res.status(201).json(updatedProcedure);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure data" });
    }
  });

  app.put("/api/procedures/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const procedureData = insertProcedureSchema.partial().parse(req.body);
      const procedure = await storage.updateProcedure(id, procedureData);
      res.json(procedure);
    } catch (error) {
      res.status(400).json({ message: "Invalid procedure data" });
    }
  });

  app.delete("/api/procedures/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProcedure(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete procedure" });
    }
  });

  // Applications routes
  app.get("/api/applications", requireAdmin, async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/my", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const applications = await storage.getUserApplications(req.user.id);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/search/:code", async (req, res) => {
    try {
      const application = await storage.getApplicationByCode(req.params.code);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to search application" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        userId: req.isAuthenticated() ? req.user.id : null
      });
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  app.put("/api/applications/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateApplicationStatus(id, status);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Feedback routes
  app.get("/api/feedback", requireAdmin, async (req, res) => {
    try {
      const feedbacks = await storage.getFeedbacks();
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get("/api/feedback/stats", async (req, res) => {
    try {
      const stats = await storage.getFeedbackStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback stats" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      res.status(400).json({ message: "Invalid feedback data" });
    }
  });

  // Contact routes
  app.get("/api/contacts", requireAdmin, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
