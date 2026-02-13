# Use Python 3.11 as base image (required for TensorFlow >= 2.18)
FROM python:3.11-slim

# Set working directory to /app
WORKDIR /app

# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
# --no-cache-dir reduces image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create models directory if it doesn't exist (it should be copied, but just in case)
RUN mkdir -p models data

# Set permissions for data directory to allow writing (Hugging Face runs as user 1000)
RUN chmod -R 777 data

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Define the command to run the application using Gunicorn for production
# Gunicorn is better than the development Flask server
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]
