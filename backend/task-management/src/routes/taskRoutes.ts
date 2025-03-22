import { Router } from 'express';
import { getTaskById, createTask, updateTask, deleteTask, getTasksByProject, getTasks, updateAssigneeStatus, uploadFile, getAttachment, deleteAttachment, updateAttachment } from '../controllers/taskController';

const router = Router();

// Define the route for getting a task by ID
router.get('/projects/:project_id/tasks/:task_id', getTaskById);

// Other task routes
router.post('/projects/:project_id/tasks', createTask);
router.patch('/projects/:project_id/tasks/:task_id', updateTask);
router.delete('/projects/:project_id/tasks/:task_id', deleteTask);
router.get('/projects/:project_id/tasks', getTasksByProject);
router.get('/my-tasks', getTasks);
router.patch('/projects/:project_id/tasks/:task_id/assignee-status', updateAssigneeStatus);
router.post('/projects/:project_id/tasks/:task_id/upload', uploadFile);
router.get('/projects/:project_id/tasks/:task_id/attachments/:attachment_id', getAttachment);
router.delete('/projects/:project_id/tasks/:task_id/attachments/:attachment_id', deleteAttachment);
router.patch('/projects/:project_id/tasks/:task_id/attachments/:attachment_id', updateAttachment);

export default router;