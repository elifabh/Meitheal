# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Stage 2: Runner
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies for Postgres
RUN apt-get update && apt-get install -y libpq-dev curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

# Copy application code files
COPY alembic.ini .
COPY alembic/ alembic/
COPY scripts/ scripts/
COPY app/ app/

# Default port for FastAPI
EXPOSE 8000

# Start server using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
