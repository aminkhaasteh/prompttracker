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
   create a Gemini key for free with a few clicks in Google AI Studio.

   ```

3. **Set up database**
   ```bash
   cd ./ (root)
   docker compose up -d
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start the application**
   ```bash
   # Terminal 1 - Start backend (from project root)
   cd backend
   npm run start:dev
   
   # Terminal 2 - Start frontend (from project root)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000


### If i had more time
- I would add a caching layer so that before sending text to the LLM, the API first checks our database to see if we’ve already processed the same response (using a simple text hash as a key). If a match is found, we immediately return the stored brands and mention counts, avoiding an unnecessary API call. Only if no cached result exists do we call the LLM, extract the data, and then store it in the database for future reuse. This would save cost, reduce latency, and make the system more efficient.
