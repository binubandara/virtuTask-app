import express from 'express';
const router = express.Router();
import { createSimpleSubtask,getSubtasksForTask,getSubtaskById,updateSubtask,deleteSubtask} from '../controllers/subTaskController';
import { authMiddleware } from '../middleware/authMiddleware';

router.post('/projects/:project_id/tasks/:task_id/subtasks', authMiddleware, createSimpleSubtask);
// Route to get all subtasks for a specific task
router.get('/projects/:project_id/tasks/:task_id/subtasks', authMiddleware, getSubtasksForTask);

router.get('/projects/:project_id/tasks/:task_id/subtasks/:subtask_id', authMiddleware, getSubtaskById);
router.patch('/projects/:project_id/tasks/:task_id/subtasks/:subtask_id', authMiddleware, updateSubtask);
router.delete('/projects/:project_id/tasks/:task_id/subtasks/:subtask_id', authMiddleware, deleteSubtask);

export default router;