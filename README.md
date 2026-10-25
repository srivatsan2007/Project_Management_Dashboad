# VeroPlan — Project Management System

<div align="center">

![VeroPlan Logo](public/logo.jpg)

# VeroPlan
**Plan • Track • Achieve**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Project__Management__Dashboad-606B3D?style=for-the-badge&logo=github)](https://github.com/srivatsan2007/Project_Management_Dashboad.git)
[![React 19](https://img.shields.io/badge/React-19.0-606B3D?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-C8DEA0?style=for-the-badge&logo=vite&labelColor=22291F)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F_3D_Workspace-22291F?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Mobile PWA](https://img.shields.io/badge/Mobile-PWA_%26_App_Ready-849B54?style=for-the-badge&logo=android)](https://github.com/srivatsan2007/Project_Management_Dashboad.git)

*A modern, full-stack, responsive project management web and mobile application featuring deep Olive (`#606B3D`) and Pistachio (`#C8DEA0`) aesthetics, real-time Supabase PostgreSQL cloud storage, interactive 3D project visualization, Kanban task workflows, roadmap milestones, and native mobile app readiness.*

</div>

---

## 📱 Mobile App & Responsive Design

VeroPlan is engineered from the ground up to operate seamlessly on both desktop and mobile devices, and is 100% ready to be wrapped or installed as a native mobile application (via PWA, Capacitor, Cordova, or React Native WebView):

- **Glassmorphic Mobile Bottom Navigation**: Floating bottom tab bar with ergonomic 48px touch targets for instant one-handed navigation (*Home*, *Projects*, *Tasks*, *My Day*, *3D World*).
- **PWA & Web App Manifest**: Full Web App Manifest (`manifest.webmanifest`) configured with `display: standalone`, app icons, theme colors, and splash branding.
- **Safe Area Insets**: Native support for notch devices and bottom home indicator bars (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
- **Mobile Touch Controls**: Touch-friendly inputs with iOS auto-zoom prevention (`>= 16px font-size`), swipeable card lists, touch momentum scrolling, and responsive bottom-sheet modals.
- **Responsive 3D Workspace**: Smooth one-touch orbit rotation, two-finger pinch-to-zoom, and responsive bottom inspector drawer on mobile viewports.

---

## 🌟 Key Application Features

### 1. 🧊 Standalone 3D Interactive Project Workspace (`/workspace-3d`)
- Dedicated full-screen interactive 3D universe powered by **Three.js** and **React Three Fiber**.
- **Visual Nodes**: Central workspace core surrounded by orbiting project nodes, satellite tasks, and floating milestone crystals.
- **Node Mechanics**: Dynamic color coding based on project priorities, animated status rings, glowing energy particles, and click-to-focus camera framing.
- **Contextual Inspector Panel**: Slide-in details inspector displaying project progress, assigned tasks, deadlines, and quick navigation shortcuts.
- **Toolbar & Sound Effects**: Camera reset, view presets, auto-orbit toggles, and audio-synthesized ambient feedback.

### 2. 🗄️ Universal Cloud Database Storage (Supabase PostgreSQL)
- **Direct Cloud Persistence**: All projects, tasks, milestones, and documents are stored directly in your Supabase PostgreSQL cloud database.
- **Universal Sign-In for Any Email**: Supports instant sign-in for any email address (`gmail.com`, `yahoo.com`, `outlook.com`, custom domains).
- **Auto-Provisioned Personal Workspaces**: Dynamically provisions personal workspaces and owner memberships so Row Level Security (RLS) policies never block user creation actions.
- **Automatic Cloud Migration (`syncLocalToCloud`)**: Any tasks or projects created while testing in guest mode automatically migrate to the cloud database the moment you sign in!

### 3. 📋 Kanban & Task Workspace (`/tasks`)
- Drag-and-drop workflow columns: **To Do**, **In Progress**, **Testing**, and **Completed**.
- Priority badges (Urgent, High, Medium, Low), due-date indicators, subtask progress meters, and milestone confetti celebrations.
- Filter and search by project, status, priority, or timeframes (Due Today, Overdue).

### 4. 🗂️ Project Hub (`/projects`)
- Grid and list views with live progress calculation derived from real completed tasks.
- Project status tracking (Planning, Active, On Hold, Completed, Archived), target deadlines, budget tracking, GitHub links, and live deployment URLs.
- Seamless creation and edit modals with loading states (`isSubmitting`) and inline error validation.

### 5. ☀️ My Day Planner (`/my-day`)
- Daily focus mode for high-priority tasks and daily checkpoints.
- Daily note scratchpad with local persistence.
- Quick task add bar to rapidly plan your day.

### 6. 🚩 Milestones & Roadmaps (`/milestones`)
- Strategic checkpoint roadmap tracking with progress radar metrics.
- One-click completion toggles and project grouping.

### 7. 📁 Document Vault (`/documents`)
- Project-linked document metadata repository with file size tracking, tag filtering, and download triggers.

### 8. 🎨 Design Customizer & Dark/Light Themes
- Dynamic accent color switcher (Pistachio Green, Olive Sage, Emerald, Amber, Mint).
- Theme modes: **Dark Olive**, **Light Sage**, and **Custom Accent**.
- Adjustable layout density (Comfortable, Compact) and corner radius (Small, Medium, Large, Full).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Core** | React 19, JavaScript (ESNext), HTML5 |
| **Build & Tooling** | Vite 8.3, Rolldown engine |
| **Routing** | React Router DOM v6 |
| **Styling** | Vanilla CSS with Design Token Architecture & HSL Color Harmonies |
| **3D Graphics** | Three.js, React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`) |
| **Cloud Database** | Supabase (PostgreSQL 15, Row Level Security, Triggers) |
| **Authentication** | Supabase Auth (Session management, auto-provisioning) |
| **Icons & Effects** | Lucide React, Canvas Confetti |
| **Mobile & PWA** | Web App Manifest (`manifest.webmanifest`), Viewport Fit Cover, Safe-Area CSS |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm** or **pnpm**
- A [Supabase](https://supabase.com) project account

### 2. Clone the Repository
```bash
git clone https://github.com/srivatsan2007/Project_Management_Dashboad.git
cd Project_Management_Dashboad
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-publishable-key
```

### 4. Database Setup & Migrations
In your Supabase Dashboard, open the **SQL Editor** and execute the migration files located in `supabase/migrations/`:

1. **`supabase/migrations/20261025000001_initial_schema.sql`**:
   - Creates the 16 core PostgreSQL tables (`workspaces`, `workspace_members`, `projects`, `tasks`, `subtasks`, `milestones`, `project_documents`, `activity_logs`, etc.).
   - Configures foreign key cascades and Row Level Security (RLS) policies.
2. **`supabase/migrations/20261025000002_auto_confirm_users.sql`**:
   - Enables auto-confirmation so that **any email address** can register and sign in immediately without email confirmation roadblocks.

### 5. Run the Local Development Server
```bash
npm run dev
```
Open `http://127.0.0.1:5173/` in your browser.

---

## 📱 Running as a Mobile App

### Option A: Mobile Browser (PWA)
1. Open the website on your phone (Chrome on Android, or Safari on iOS).
2. Tap the browser menu (or Share button on iOS) and tap **"Add to Home Screen"**.
3. VeroPlan will install and launch as a standalone, fullscreen mobile application with the custom logo and bottom navigation.

### Option B: Native Mobile App via Android Studio (Pre-configured!)
The native Android project is **already initialized and configured** in the `android/` directory!

#### 1. Open in Android Studio
You can open the project in Android Studio with a single command:
```bash
npm run cap:android
```
*Or manually:*
1. Open **Android Studio**.
2. Click **Open** (or `File -> Open`).
3. Select the `android` folder located at `d:\Code\ProjectHub\android`.
4. Wait for Gradle sync to finish.

#### 2. Run or Build APK
- **To test on phone/emulator**: Connect your Android phone via USB (with USB Debugging turned ON) or start an Android Virtual Device (AVD), then click the green **▶ Run** button.
- **To generate an APK file**: In Android Studio menu, click **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**. Once built, copy the `.apk` file to your phone and install it directly!

#### 3. Updating the App After Web Changes
Whenever you change your React components or pages:
```bash
npm run build
npm run cap:sync
```
This updates the web files inside Android Studio automatically.

---

## 🚀 Deploying to Vercel

### 1. Import Git Repository
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** ➔ **Project**.
3. Select your GitHub repository: `srivatsan2007/Project_Management_Dashboad`.

### 2. Configure Environment Variables (REQUIRED)
Before clicking **Deploy**, expand the **Environment Variables** section and add:

| Key | Value Source | Example / Notes |
|:---|:---|:---|
| `VITE_SUPABASE_URL` | Supabase Dashboard ➔ Project Settings ➔ API ➔ Project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard ➔ Project Settings ➔ API ➔ `anon` / `public` Key | `eyJhbGciOi...` |

> [!IMPORTANT]
> Without these environment variables, the app will run in local demo mode and cannot authenticate users or sync cloud data.

### 3. Deploy
- **Framework Preset**: Vite (detected automatically)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Click **Deploy**!

*(The included `vercel.json` ensures that direct links to `/workspace-3d`, `/projects`, `/tasks`, etc., work cleanly without 404 errors on refresh).*

---

## 📦 Production Build

To build the production-ready minified bundle:
```bash
npm run build
```
To preview the build locally:
```bash
npm run preview
```

---

## 🌿 Git Push Instructions

To push this codebase to your GitHub repository:
```bash
git remote add origin https://github.com/srivatsan2007/Project_Management_Dashboad.git
git branch -M main
git add .
git commit -m "feat: complete VeroPlan platform with Supabase database, 3D workspace, and mobile app readiness"
git push -u origin main
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with passion for high-performance productivity • <strong>VeroPlan</strong></sub>
</div>
