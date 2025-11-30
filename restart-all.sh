#!/bin/bash

# Script untuk restart semua server Tarumenyan Chatbot
# Usage: ./restart-all.sh

echo "🔄 Restarting Tarumenyan Chatbot Servers..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill existing processes
echo "${YELLOW}Stopping existing servers...${NC}"

# Kill Rasa servers
pkill -f "rasa run" 2>/dev/null
pkill -f "rasa run actions" 2>/dev/null

# Kill backend server
pkill -f "node.*server.js" 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Kill frontend dev server
pkill -f "vite" 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

sleep 2
echo "${GREEN}✓ Stopped existing servers${NC}"
echo ""

# Check if Rasa is installed
if command -v rasa &> /dev/null; then
    RASA_CMD="rasa"
elif [ -f ".venv/bin/rasa" ]; then
    RASA_CMD=".venv/bin/rasa"
    echo "${YELLOW}Using Rasa from .venv${NC}"
else
    echo "${RED}❌ Rasa not found!${NC}"
    echo "${YELLOW}Install Rasa first:${NC}"
    echo "  python3 -m venv .venv"
    echo "  source .venv/bin/activate"
    echo "  pip install rasa"
    echo ""
    echo "${YELLOW}Skipping Rasa servers, continuing with Backend & Frontend...${NC}"
    echo ""
    RASA_CMD=""
fi

# Start Rasa servers if available
if [ -n "$RASA_CMD" ]; then
    # Start Rasa Action Server
    echo "${YELLOW}Starting Rasa Action Server...${NC}"
    cd "$(dirname "$0")"
    nohup $RASA_CMD run actions > logs/rasa-actions.log 2>&1 &
    ACTIONS_PID=$!
    echo "${GREEN}✓ Rasa Actions running (PID: $ACTIONS_PID)${NC}"
    echo ""

    # Wait for action server to start
    sleep 3

    # Start Rasa Core Server
    echo "${YELLOW}Starting Rasa Core Server...${NC}"
    nohup $RASA_CMD run --enable-api --cors "*" --port 5005 > logs/rasa-core.log 2>&1 &
    RASA_PID=$!
    echo "${GREEN}✓ Rasa Core running (PID: $RASA_PID)${NC}"
    echo ""
else
    ACTIONS_PID="N/A"
    RASA_PID="N/A"
fi

# Wait for Rasa to fully start
sleep 5

# Start Backend Server
echo "${YELLOW}Starting Backend Server...${NC}"
cd tarumenyan/backend-trm
nohup node server.js > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../..
echo "${GREEN}✓ Backend running on port 3001 (PID: $BACKEND_PID)${NC}"
echo ""

# Start Frontend Server
echo "${YELLOW}Starting Frontend Dev Server...${NC}"
cd tarumenyan/tarumenyan-web
nohup npm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..
echo "${GREEN}✓ Frontend running on port 5173 (PID: $FRONTEND_PID)${NC}"
echo ""

# Create logs directory if not exists
mkdir -p logs

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}✅ All servers started successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Server URLs:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3001"
echo "   Rasa:      http://localhost:5005"
echo ""
echo "📋 Process IDs:"
echo "   Rasa Actions: $ACTIONS_PID"
echo "   Rasa Core:    $RASA_PID"
echo "   Backend:      $BACKEND_PID"
echo "   Frontend:     $FRONTEND_PID"
echo ""
echo "📂 Logs location: ./logs/"
echo ""
echo "⏹️  To stop all servers, run: ./stop-all.sh"
echo "📊 To view logs: tail -f logs/rasa-core.log"
echo ""
