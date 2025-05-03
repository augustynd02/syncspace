# syncspace

A social media platform for synchroning with those who matter and connecting in a shared digital space, designed to make collaboration, interaction, and sharing a breeze.

## Features

- 📝 Create posts with text and images  
- 💬 Comment and like posts  
- 👥 Add friends and view their activity  
- 🧠 Get user recommendations  
- 🔔 Notifications for user actions
- 💬 Real-time chat with websockets

## Tech Stack

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/><img src="https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/><img src="https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/><img src="https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white"/><img src="https://img.shields.io/badge/PostgreSQL-green?style=for-the-badge"/><img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white"/><img src="https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white"/><img src="https://img.shields.io/badge/Amazon_Web_Services-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white"/>

## Setup

```bash
# Clone the repo
git clone https://github.com/augustynd02/syncspace.git
cd syncspace

# Install dependencies on client
cd client
npm install

# Install dependencies on server
cd server
npm install

# Create and configure server/.env
PORT=8000

DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/syncspace?schema=public"
FRONTEND_URL=your_frontend_url
TOKEN_SECRET=your_token_secret
BUCKET_NAME=your_bucket_name
BUCKET_REGION=your_bucket_region
ACCESS_KEY=your_access_key
SECRET_ACCESS_KEY=your_secret_access_key

# Push prisma schema to DB
npx prisma db push

# Start the app in the root directory
npm run dev
