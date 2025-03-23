# Stage 1: Install Dependencies
FROM python:3.9-slim AS dependencies
WORKDIR /app
COPY productivity/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Copy Application
FROM python:3.9-slim AS builder
WORKDIR /app
COPY --from=dependencies /usr/local/lib/python3.9/site-packages ./usr/local/lib/python3.9/site-packages
COPY productivity/. ./

# Stage 3: Production Image
FROM gcr.io/distroless/python3
WORKDIR /app
COPY --from=builder /app/. ./
EXPOSE 5000
CMD ["python", "app.py"] # Or your Flask app's entry point