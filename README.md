# PromptTracker - Brand Mention Analyzer

A modern web application that analyzes text content to extract and count brand mentions using AI technology.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aminkhaasteh/prompttracker.git
   cd prompttracker
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install

   # Change the .env.sample to .env

   ```

4. **Set up database**
   ```bash
   cd ./ (root)
   docker compose up -d
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the application**
   ```bash
   # Terminal 1 - Start backend (from project root)
   cd backend && npm run start:dev
   
   # Terminal 2 - Start frontend (from project root)
   cd frontend && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000


### Database Schema
- `lLMResponse` - Stores original text inputs
- `mention` - Stores brand detection results
