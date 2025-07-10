#!/bin/bash

# Support Bot Startup Script
echo "Starting Support Bot System..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
pip install -r requirements.txt

echo ""
echo "=================================================="
echo "Support Bot System is starting..."
echo "=================================================="
echo "Customer Portal: http://localhost:5000"
echo "Admin Dashboard: http://localhost:5000/admin"
echo "API Documentation: See README.md"
echo "=================================================="
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the application
python app.py