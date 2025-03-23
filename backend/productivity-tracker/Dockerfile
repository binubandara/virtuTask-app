# Use Python 3.13 slim image
FROM python:3.13.0-alpine3.19

# Set working directory
WORKDIR /app/productivity-tracker

# Accept port as build argument
ARG PORT=5000

# Set environment variables
ENV PORT=${PORT} \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=src/main.py \
    FLASK_ENV=production

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    gcc \
    python3-dev \
    musl-dev

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD wget -q -O- http://localhost:${PORT}/health || exit 1

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:${PORT}", "src.main:app"]