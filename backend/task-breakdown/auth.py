from fastapi import FastAPI, Depends, HTTPException, status, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
import httpx  # Use httpx for async requests
from typing import Optional

load_dotenv()

app = FastAPI()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:5001/api/auth/verify-token") #Added AUTH SERVICE URL


async def verify_token_from_auth_service(token: str) -> Optional[str]:
    """
    Verifies the token with the external authentication service and returns the employeeId if valid.

    Args:
        token: The JWT token to verify.

    Returns:
        The employeeId if the token is valid, otherwise None.  Returns None if an error occurs
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(AUTH_SERVICE_URL, json={"token": token}, timeout=5)
            response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
            user_data = response.json()
            employee_id = user_data.get("employeeId")
            return employee_id
        except httpx.HTTPStatusError as e:
            print(f"Error from auth service: {e}")
            return None
        except httpx.RequestError as e:
            print(f"Failed to reach auth service: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error during token verification: {e}")
            return None


@app.post("/verify-token")
async def verify_token(request: Request):
    """
    Endpoint to verify a token against the external authentication service.

    Args:
        request: The FastAPI Request object containing the token in the body.

    Returns:
        A JSON response indicating the verification status and the employeeId if successful.
    """
    try:
        data = await request.json()
        token = data.get("token")

        if not token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token is required")

        employee_id = await verify_token_from_auth_service(token)

        if not employee_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        return JSONResponse(
            content={"status": "success", "message": f"Verified as employee {employee_id}", "employeeId": employee_id}
        )
    except HTTPException as http_exception:
        raise http_exception # Re-raise the exception for consistent handling.
    except Exception as e:
        print(f"Error verifying token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error"
        )


async def auth_middleware(request: Request, authorization: Optional[str] = Header(None)):
    """
    Authenticates the user either through a session (if you had sessions set up)
    or by verifying the token in the Authorization header against the auth service.

    Args:
        request: The FastAPI Request object.
        authorization: The Authorization header (optional).

    Returns:
        The employeeId if authentication is successful.

    Raises:
        HTTPException: If authentication fails.
    """

    employee_id = None

    #  If you had session management set up with something like FastAPI-Sessions
    # if "employee_id" in request.session:
    #    employee_id = request.session["employee_id"]

    if not employee_id:  # Not in session, check Authorization header
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated - Missing or malformed Authorization header",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = authorization.split(" ")[1]
        employee_id = await verify_token_from_auth_service(token) #Use the function to verify token

        if not employee_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    #Attach to the request for use in the route handlers
    request.state.employee_id = employee_id
    return employee_id


# Example route that uses the authentication middleware
@app.get("/protected")
async def protected_route(employee_id: str = Depends(auth_middleware)):
    return {"message": f"Hello, employee {employee_id}!"}