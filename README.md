# CampusConnect: Smart College Management Platform

Welcome to the **CampusConnect** repository!

> **📍 Important Note for Reviewers:**
> All of the main application code (frontend, backend, and API routes) is located inside the `campus-connect` directory.

## Live Demo
🌍 **[https://project-space-vert.vercel.app/](https://project-space-vert.vercel.app/)**

## About The Project
CampusConnect is a modern, full-stack Next.js web application designed to bridge the communication gap between Students, Faculty, and Administrators. 

**Key Features Include:**
- **Role-Based Dashboards:** Dedicated, secure portals for Students, Faculty, and Admins.
- **Dynamic Permission Workflows:** Students can submit permission/leave requests which are routed directly to faculty for approval or rejection.
- **Universal Campus Forums:** A real-time global chat and Doubts & Q&A section where the entire campus can interact.
- **AI Integration:** A built-in AI assistant to help students draft letters, answer academic questions, and automatically flag high-priority requests for admins.
- **Admin Moderation:** Powerful analytics, system controls, and content moderation tools.

## How to Run Locally

1. Navigate into the application directory:
   ```bash
   cd campus-connect
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 How to Deploy (Live Link)
To create a live link that updates automatically every time you push to GitHub, deploying to **Vercel** is highly recommended:

1. Create a free account on [Vercel](https://vercel.com/signup).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`Jayanagasri-58/ProjectSpace`).
4. In the configuration settings, **CRITICAL**: Make sure to set the **Root Directory** to `campus-connect`.
5. Click **Deploy**. Vercel will build your project and give you a live URL (e.g., `https://campus-connect-demo.vercel.app`).
6. Every time you push new code to your GitHub `main` branch, Vercel will automatically redeploy and update your live link!

*Once you get your Vercel URL, replace the `[Insert your Live Project Link Here]` placeholder at the top of this README with your real link.*
