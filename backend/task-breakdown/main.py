from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import os
from dotenv import load_dotenv
import asyncio
import time
import google.generativeai as genai
from google.ai.generativelanguage import GenerateContentResponse  # Import the response type
import json

load_dotenv()

app = FastAPI(title="Task Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL")
print(f"MONGODB_URL from env: {MONGODB_URL}")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL environment variable not set.")

client = AsyncIOMotorClient(MONGODB_URL)
db = client.get_database()

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

genai.configure(api_key=GEMINI_API_KEY)

# Rate Limiting Configuration
RATE_LIMIT_WINDOW = 60  # seconds
MAX_REQUESTS_PER_WINDOW = 20
request_counts = {}

# Data Models
class SubTask(BaseModel):
    step: str
    timeEstimate: str
    dependencies: List[str]
    resources: List[str]

class TaskAnalysis(BaseModel):
    task: str
    subtasks: List[SubTask]

class TaskRequest(BaseModel):
    task_id: str  # Changed to receive only task_id

class TaskResponse(BaseModel):
    task_id: str
    main_task: str
    categories: List[str]
    estimated_duration: str
    priority_score: int
    critical_path: List[str]
    risk_factors: List[str]

# Helper Functions
def check_rate_limit(client_ip: str):
    """Checks if the client has exceeded the rate limit."""
    now = time.time()
    if client_ip not in request_counts:
        request_counts[client_ip] = []

    request_counts[client_ip] = [ts for ts in request_counts[client_ip] if ts > now - RATE_LIMIT_WINDOW]

    if len(request_counts[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    request_counts[client_ip].append(now)

async def analyze_with_ai(task: str) -> str:
    """Uses Gemini to analyze and break down the task."""
    try:
        model = genai.GenerativeModel('gemini-pro')  # Specify the model

        prompt = f"""You are a project management expert.
            Break down tasks into detailed steps with time estimates, dependencies,
            and resource requirements. Be specific and practical. Provide the response in JSON format only.  Do not use markdown code fences. Analyze this task: {task}""" #Removed markdown and clarified the JSON

        response: GenerateContentResponse = model.generate_content(prompt)  # Get the Gemini response

        if response.prompt_feedback and response.prompt_feedback.block_reason:
           raise HTTPException(status_code=400, detail=f"Gemini API blocked the prompt: {response.prompt_feedback.block_reason}")

        if not response.text:
            raise HTTPException(status_code=500, detail="Gemini API returned an empty response.")

        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")  # Log the error
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")


async def calculate_priority_score(task: str, deadline: Optional[datetime], priority: Optional[str]) -> int:
    """Calculates priority score based on various factors."""
    base_score = 50

    if priority:
        priority_weights = {"low": 10, "medium": 20, "high": 30}
        base_score += priority_weights.get(priority.lower(), 0)

    if deadline:
        days_until_deadline = (deadline - datetime.now()).days
        if days_until_deadline < 7:
            base_score += 30
        elif days_until_deadline < 30:
            base_score += 20

    return min(base_score, 100)

# API Endpoints
@app.post("/api/analyze-task")
async def analyze_task(task_request: TaskRequest, request: Request):
    """Analyzes a task using Gemini and stores the analysis in a separate collection."""
    client_ip = request.client.host
    check_rate_limit(client_ip)

    try:
        task_id = task_request.task_id.strip()
        task_id_str = str(task_id)

        print(f"Received task_id: {task_id_str}")

        # Database and Collection Verification
        print(f"Connected to database: {db.name}")
        tasks_collection = db["tasks"]

        task = await tasks_collection.find_one({"task_id": task_id_str})

        if not task:
            print(f"Task not found in database with task_id: {task_id_str}")
            raise HTTPException(status_code=404, detail="Task not found")

        # Extract AI analysis from Gemini
        ai_analysis_text = await analyze_with_ai(task["name"])
        print(f"Raw AI Analysis: {ai_analysis_text}")

        # Parse the AI analysis text
        try:
            ai_analysis_text = ai_analysis_text.replace("```json", "").replace("```", "")
            ai_analysis_json = json.loads(ai_analysis_text)

            # Debugging: Print the parsed JSON to inspect its structure
            print(f"Parsed AI Analysis JSON: {ai_analysis_json}")
           # Debugging: Print the parsed JSON to inspect its structure
            print(f"Parsed AI Analysis JSON: {ai_analysis_json}")
            subtasks_data = ai_analysis_json.get("steps", [])
            steps = []

            for subtask_data in subtasks_data:
                subtask = SubTask(
                    step = subtask_data.get("description", "Unspecified"),
                    timeEstimate = subtask_data.get("time_estimate", "Unknown"),
                    dependencies = subtask_data.get("dependencies", []),
                    resources = subtask_data.get("resources", [])
                )
                steps.append(subtask)

            task_analysis = TaskAnalysis(
                task = ai_analysis_json.get("task", "No Task"),
                subtasks = steps
            )
            # Store the analysis in the 'task_analyses' collection
            task_analyses_collection = db["task_analyses"]
            await task_analyses_collection.insert_one(task_analysis.dict())

            return {"message": "Task analysis stored successfully."}  # Return a success message

        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response as JSON: {e}. Raw response: {ai_analysis_text}")

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/api/task/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    """Retrieves a task from MongoDB by its task_id."""
    task = await db["tasks"].find_one({"task_id": task_id})
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskResponse(**task)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)