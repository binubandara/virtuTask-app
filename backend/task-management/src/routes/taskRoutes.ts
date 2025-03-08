import express from "express";
import { getTasks, createTask, updateTask, deleteTask, getTask, createProject,getProjects,getProject,updateProject, deleteProject,updateAssigneeStatus,uploadFile} from '../controllers/taskController';

const router = express.Router();


// Get all tasks
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await getTasks(req, res);
    res.json(tasks);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Create a new task
router.post("/tasks", async (req, res) => {
  try {
    const task = await createTask(req, res);
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
});

// Get a single task by ID
router.get("/tasks/:task_id", async (req, res) => {
  try {
    const task = await getTask(req, res);
    res.json(task);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Update a task by ID
router.patch("/tasks/:task_id", async (req, res) => {
  try {
    const task = await updateTask(req, res);
    res.json(task);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
});

// Delete a task by ID
router.delete("/tasks/:task_id", async (req, res) => {
  try {
    await deleteTask(req, res);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
});

// Create a new project
router.post("/projects", async (req, res) => {
  try {
    const project = await createProject(req, res);
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
});

// Get all projects
router.get("/projects", async (req, res) => {
  try {
    const projects = await getProjects(req, res);
    res.json(projects);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Get a single project by ID
router.get("/projects/:project_id", async (req, res) => {
  try {
    const project = await getProject(req, res);
    res.json(project);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Update a project by ID
router.patch("/projects/:project_id", async (req, res) => {
  try {
    const project = await updateProject(req, res);
    res.json(project);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
});

// Delete a project by ID
router.delete("/projects/:project_id", async (req, res) => {
  try {
    await deleteProject(req, res);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      if (!res.headersSent) {
        res.status(400).json({ error: error.message });
      }
    } else {
      if (!res.headersSent) {
        res.status(400).json({ error: 'An unknown error occurred' });
      }
    }
  }
});

// Route for updating task status based on assignees
router.patch('/tasks/:task_id/update-status', async (req, res) => {
  try {
  await updateAssigneeStatus(req, res);
  } catch (error) {
  if (error instanceof Error) {
  res.status(400).json({ error: error.message });
  } else {
  res.status(400).json({ error: 'An unknown error occurred' });
  }
  }
  });

  
// File upload route
router.post('/tasks/:task_id/upload', uploadFile);

    
export default router;