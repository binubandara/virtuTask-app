import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProject,
  updateAssigneeStatus,
  uploadFile,
  getAttachment,
  deleteAttachment,
  updateAttachment
} from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth'; 

const router = express.Router();



// Task CRUD operations
router.post('/projects/:project_id/tasks', authMiddleware, createTask);
router.get('/projects/my-tasks', authMiddleware,getTasks);
router.get('/projects/tasks/:task_id', authMiddleware,getTaskById);
router.patch('/projects/:project_id/tasks/:task_id', authMiddleware,updateTask);
router.delete('/projects/:project_id/tasks/:task_id', authMiddleware, deleteTask);

// // Project-specific tasks
router.get('/projects/:project_id/tasks', authMiddleware,getTasksByProject);

// // Assignee Status Update
router.patch('/:projects/:project_id/tasks/:task_id/assignee-status', authMiddleware, updateAssigneeStatus);

// // File Upload and Attachment Routes
router.post('/projects/:project_id/tasks/:task_id/attachments', authMiddleware,uploadFile);
router.get('/projects/:project_id/tasks/:task_id/attachments/:attachment_id', authMiddleware,getAttachment);
router.delete('/projects/:project_id/tasks/:task_id/attachments/:attachment_id',authMiddleware, deleteAttachment);
router.patch('/projects/:project_id/tasks/:task_id/attachments/:attachment_id', authMiddleware,updateAttachment);


export default router;









