#!/bin/bash

# Script untuk stop semua server Tarumenyan Chatbot
# Usage: ./stop-all.sh

echo "🛑 Stopping Tarumenyan Chatbot Servers..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill Rasa servers
echo "${YELLOW}Stopping Rasa servers...${NC}"
pkill -f "rasa run" 2>/dev/null
pkill -f "rasa run actions" 2>/dev/null
lsof -ti:5005 | xargs kill -9 2>/dev/null
lsof -ti:5055 | xargs kill -9 2>/dev/null
echo "${GREEN}✓ Rasa servers stopped${NC}"

# Kill backend server
echo "${YELLOW}Stopping Backend server...${NC}"
pkill -f "node.*server.js" 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
echo "${GREEN}✓ Backend server stopped${NC}"

# Kill frontend dev server
echo "${YELLOW}Stopping Frontend server...${NC}"
pkill -f "vite" 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
echo "${GREEN}✓ Frontend server stopped${NC}"

echo ""
echo "${GREEN}✅ All servers stopped successfully!${NC}"
echo ""
