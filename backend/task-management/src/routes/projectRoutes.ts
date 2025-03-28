import express from 'express';
import { createProject, getProjects, getProject, updateProject, deleteProject } from '../controllers/projectController'; // Adjust path as needed
import { authMiddleware } from '../middleware/authMiddleware'; // Adjust path as needed

const router = express.Router();

// Protect the route with authentication middleware
router.post('/projects', authMiddleware, createProject);
// Protected route setup
router.get('/my-projects', authMiddleware, getProjects);

router.get('/projects/:project_id', authMiddleware, getProject);

router.patch('/projects/:project_id', authMiddleware, updateProject);

router.delete('/projects/:project_id', authMiddleware, deleteProject);



export default router;