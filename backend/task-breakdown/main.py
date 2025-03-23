from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict
import os
from dotenv import load_dotenv
import asyncio
import time
import google.generativeai as genai
from google.ai.generativelanguage import GenerateContentResponse
import json
import re
import uuid
from auth import auth_middleware
from typing import List, Dict, Optional
from pydantic import BaseModel

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
RATE_LIMIT_WINDOW = 60
MAX_REQUESTS_PER_WINDOW = 20
request_counts = {}

# Data Models
class SubTask(BaseModel):
    step: str
    time_estimate: str

class TaskAnalysis(BaseModel):
    user_id: str # Add user_id
    project_id: str  # Add project_id
    
    task_id: str
    task: str
    subtasks: List[SubTask]
    

class TaskRequest(BaseModel):
    task_id: str

class TaskResponse(BaseModel):
    task_id: str
    main_task: str
    categories: List[str]
    estimated_duration: str
    priority_score: int
    critical_path: List[str]
    risk_factors: List[str]

class ChatRequest(BaseModel):
    user_message: str
    conversation_id: Optional[str] = None  # Optional ID to track conversations

class ChatResponse(BaseModel):
    conversation_id: str
    gemini_response: str

class Message(BaseModel):
    user: str
    message: str

class SingleConversation(BaseModel):
    conversation_id: str
    messages: List[Message]

class Conversation(BaseModel):
    user_id: str
    conversations: List[SingleConversation]


# Helper Functions
def check_rate_limit(client_ip: str):
    now = time.time()
    if client_ip not in request_counts:
        request_counts[client_ip] = []

    request_counts[client_ip] = [ts for ts in request_counts[client_ip] if ts > now - RATE_LIMIT_WINDOW]

    if len(request_counts[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    request_counts[client_ip].append(now)

async def analyze_with_ai(task_name: str, description: str, priority: str, due_date: str) -> str:  # Modified function signature
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"""You are a project management expert. Analyze the following task, considering its priority, due date, and description, and break it down into detailed steps with time estimates. Be specific and practical.

        Task Name: {task_name}
        Description: {description}
        Priority: {priority}
        Due Date: {due_date if due_date else "No Due Date"}

        Provide the response in JSON format ONLY. The JSON should be a valid JSON object with a "task" field (string) and a "steps" field (array of objects). Each object in the "steps" array should have a "description" field (string) and a "time_estimate" field (string). Ensure that all strings in the JSON are properly escaped. Do not include any text outside of the JSON structure.  Do not use markdown code fences."""

        response: GenerateContentResponse = model.generate_content(prompt)

        if response.prompt_feedback and response.prompt_feedback.block_reason:
           raise HTTPException(status_code=400, detail=f"Gemini API blocked the prompt: {response.prompt_feedback.block_reason}")

        if not response.text:
            raise HTTPException(status_code=500, detail="Gemini API returned an empty response.")

        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")


async def calculate_priority_score(task: str, deadline: Optional[datetime], priority: Optional[str]) -> int:
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

async def chat_with_gemini(user_message: str):
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        #context = "\n".join([f"{msg['user']}: {msg['message']}" for msg in conversation_history_list])

        prompt = f"""You are a helpful chatbot. Respond to the user's message.  Do not include information that is not in the user's question.
            User Message: {user_message}"""

        response: GenerateContentResponse = model.generate_content(prompt)

        if response.prompt_feedback and response.prompt_feedback.block_reason:
           raise HTTPException(status_code=400, detail=f"Gemini API blocked the prompt: {response.prompt_feedback.block_reason}")

        if not response.text:
            raise HTTPException(status_code=500, detail="Gemini API returned an empty response.")

        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

# Conversation Memory (Database)
async def get_conversation_history(conversation_id: str) -> List[Dict[str, str]]:
    conversation = await db["conversations"].find_one({"conversation_id": conversation_id})
    if conversation:
        return conversation["messages"]
    else:
        return []

async def store_message(conversation_id: str, user: str, message: str):
    await db["conversations"].update_one(
        {"conversation_id": conversation_id},
        {"$push": {"messages": {"user": user, "message": message}}},
        upsert=True,  # Creates the conversation if it doesn't exist
    )
# API Endpoints
@app.post("/projects/{project_id}/tasks/{task_id}/analyze-task")
async def analyze_task(request: Request, project_id: str, task_id: str, user_id: str = Depends(auth_middleware)):
    client_ip = request.client.host
    check_rate_limit(client_ip)

    try:
        project_id = project_id.strip()
        project_id_str = str(project_id)
        task_id = task_id.strip()
        task_id_str = str(task_id)
        print(f"Processing task {task_id_str} for project {project_id_str} (user: {user_id})")


        print(f"Received task_id: {task_id_str}")

        tasks_collection = db["tasks"]
        task = await tasks_collection.find_one({"task_id": task_id_str})

        if not task:
            print(f"Task not found in database with task_id: {task_id_str}")
            raise HTTPException(status_code=404, detail="Task not found")

        task_name = task["name"]
        description = task.get("description", "")  # Get the description, default to empty string if missing
        priority = task.get("priority", "Not specified")  # Get the priority, default to "Not specified"
        due_date = task.get("dueDate")
        due_date_str = ""

        if due_date:
            if isinstance(due_date, dict) and "$date" in due_date: # handles mongo date object
                due_date_str = datetime.fromisoformat(due_date["$date"].replace('Z', '+00:00')).strftime("%Y-%m-%d")
            else:
                try: # maybe it is already a datetime object
                    due_date_str = due_date.strftime("%Y-%m-%d")
                except:
                   print("Failed to parse due date")

        ai_analysis_text = await analyze_with_ai(task_name, description, priority, due_date_str) # Modified call
        print(f"Raw AI Analysis: {ai_analysis_text}")

        try:
            # Define the sanitize_json_string function HERE (insert the whole function definition)
            def sanitize_json_string(json_string: str) -> str:
                # Replace control characters and escape special JSON characters
                json_string = re.sub(r"[\x00-\x1F]", "", json_string)  # Remove control characters

                # Escape backslashes, double quotes, and single quotes
                json_string = json_string.replace("\\", "\\\\")  # Escape backslashes
                json_string = json_string.replace("\"", "\\\"")  # Escape double quotes
                json_string = json_string.replace("'", "\\'")  # Escape single quotes, needed for the "s"

                return json_string
            # 3. Attempt to parse, catching common errors

            # Remove Markdown code block
            ai_analysis_text = ai_analysis_text.replace("```json", "").replace("```", "")
            ai_analysis_text = ai_analysis_text.strip()  # Remove leading/trailing whitespace

            try:
                ai_analysis_json = json.loads(ai_analysis_text)
            except json.JSONDecodeError as e:
                print(f"JSONDecodeError after removing markdown and sanitization: {e}")
                # Attempt more aggressive cleaning if needed
                # Remove any characters that aren't valid in JSON
                ai_analysis_text = re.sub(r'[^\x20-\x7F]+', '', ai_analysis_text)  # Remove non-ASCII characters
                try:
                    ai_analysis_json = json.loads(ai_analysis_text) # try again
                except json.JSONDecodeError as e:
                    raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response as JSON even after aggressive cleaning: {e}. Raw response: {ai_analysis_text}")
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"Unexpected error while cleaning and parsing JSON: {e}")


            print(f"Parsed AI Analysis JSON: {ai_analysis_json}")

            subtasks_data = ai_analysis_json.get("steps", [])
            steps = []

            for subtask_data in subtasks_data:
                subtask = SubTask(
                    step = subtask_data.get("description", "Unspecified"),  # Changed to use "description"
                    time_estimate = subtask_data.get("time_estimate", "Unknown"),
                )
                steps.append(subtask)

            task_analysis = TaskAnalysis(
                task_id = task_id_str,  # ADD THIS LINE
                task = ai_analysis_json.get("task", "No Task"),
                subtasks = steps,
                project_id = project_id_str, # ADD THIS LINE
                user_id = user_id # ADD THIS LINE
            )
            task_analyses_collection = db["task_analyses"]
            await task_analyses_collection.insert_one(task_analysis.dict())

            return {"message": "Task analysis stored successfully."}

        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response as JSON: {e}. Raw response: {ai_analysis_text}")

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

#Retrieve TaskAnalysis by task_id
@app.get("/api/analysis/{task_id}", response_model=TaskAnalysis)
async def get_task_analysis(task_id: str):
    task_analysis = await db["task_analyses"].find_one({"task_id": task_id})
    if task_analysis is None:
        raise HTTPException(status_code=404, detail="Task analysis not found")
    return TaskAnalysis(**task_analysis)

@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    chat_request: ChatRequest,
    user_id: str = Depends(auth_middleware)  # Get the user ID
):
    user_message = chat_request.user_message.strip()
    conversation_id = chat_request.conversation_id or str(uuid.uuid4())  # Generate a new ID if none

    gemini_response = await chat_with_gemini(user_message)

    # Structure for the message
    new_message = {"user": "user", "message": user_message}
    new_gemini_message = {"user": "gemini", "message": gemini_response}
    
    # Structure for the conversation
    new_single_conversation = SingleConversation(
        conversation_id=conversation_id,
        messages=[
            Message(user="user", message=user_message),
            Message(user="gemini", message=gemini_response),
        ],
    )

    # Find if a document exists for this user
    conversation = await db["conversations"].find_one({"user_id": user_id})

    # If the user has no previous conversations, create a new document
    if not conversation:
        new_conversation = Conversation(
            user_id=user_id,
            conversations=[new_single_conversation],
        )
        await db["conversations"].insert_one(new_conversation.dict())

    # If the user already has conversations, add this one to the existing document
    else:
        await db["conversations"].update_one(
            {"user_id": user_id},
            {"$push": {"conversations": new_single_conversation.dict()}},
        )

    return ChatResponse(conversation_id=conversation_id, gemini_response=gemini_response)

#New GET route for conversations
@app.get("/api/conversations/{user_id}", response_model=Conversation)
async def get_conversations(user_id: str):
    conversation = await db["conversations"].find_one({"user_id": user_id})
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversations not found")
    return Conversation(**conversation)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)