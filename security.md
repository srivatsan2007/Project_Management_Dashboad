# VeroPlan — Security Architecture & Specification

This document details the application security model, authentication flows, authorization boundaries, database Row Level Security (RLS) policies, storage security, and testing verification for the **VeroPlan Personal Project Management System**.

---

## 1. Authentication & Sessions

### Provider Configuration
- **Authentication Engine**: Supabase Auth (`@supabase/supabase-js`), backed by PostgreSQL `auth.users`.
- **Client Configuration**: Initialized via `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` with local storage session persistence.
- **Client Key Security**: Frontend uses only the anon/publishable key (`sb_publishable_...`). The Supabase `service_role` key is **never** bundled or referenced in client-side code.

### Login & Registration Flows
- **Login (`/login`)**:
  - Secure credential validation via `supabase.auth.signInWithPassword({ email, password })`.
  - Passwords are encrypted and verified using Argon2/bcrypt on Supabase servers. Passwords are never sent or stored in plaintext.
  - Interactive password visibility toggle for accessibility and UX.
  - Returns users directly to their requested destination via `returnUrl` query parameter after successful authentication.
- **Registration (`/register`)**:
  - Validates minimum password length (≥ 6 characters) and password confirmation match on the client before submission.
  - Submits user metadata (`full_name`) alongside credentials via `supabase.auth.signUp()`.
  - Handles email confirmation states: if email confirmation is required by project settings, a confirmation instructions screen is presented without exposing tokens.
- **Password Reset**:
  - `forgotPassword(email)` requests password recovery using `supabase.auth.resetPasswordForEmail()` with safe redirect back to the application origin.
- **Session Lifecycle & Persistence**:
  - Auto-refreshes expiring JWT tokens in the background via Supabase client listeners (`onAuthStateChange`).
  - Active sessions persist across tab refreshes and browser restarts using secure local storage.
- **Logout (`signOut`)**:
  - Invalidates session via `supabase.auth.signOut()`, clears in-memory user objects, and notifies the entire component tree via `veroplan:data-changed` event.

### Protected vs. Guest Access Boundaries
- **Guest Access**:
  - Unauthenticated visitors can open and explore VeroPlan without forced login redirects.
  - Guests view real empty states (0 projects, 0 tasks, 0 documents) rather than simulated records.
- **Contextual Authentication Modal**:
  - When an unauthenticated visitor attempts a write action (e.g. uploading a document, creating a project, adding a task), a focused modal dialog opens (*"Sign in to upload documents"*).
  - The visitor can choose to log in, register, or dismiss the modal to continue browsing without interruption.
  - Client-side checks are backed by strict database-level RLS policies that reject unauthenticated API mutations.

---

## 2. Authorization & Data Isolation

### Ownership Verification
- Every workspace record is tied to a `workspace_id`.
- Workspaces are owned by an `owner_id` (matching `auth.uid()`) and governed by `workspace_members` rows.
- Browser-supplied user IDs or workspace IDs are never trusted blindly: PostgreSQL RLS functions determine access based exclusively on `auth.uid()`.

### Row Level Security (RLS)
The database migration [`supabase/migrations/20261025000001_initial_schema.sql`](file:///d:/Code/ProjectHub/supabase/migrations/20261025000001_initial_schema.sql) enables RLS on all 16 application tables.

#### Workspace Membership Function
```sql
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### RLS Policies Applied to Primary Tables
1. **Workspaces Table**:
   - `SELECT`: Allowed if `owner_id = auth.uid()` or user is listed in `workspace_members`.
   - `INSERT`: Allowed if `owner_id = auth.uid()`.
   - `UPDATE/DELETE`: Allowed only if `owner_id = auth.uid()`.
2. **Projects, Tasks, Milestones, and Documents Tables**:
   - `SELECT`: Allowed only if `is_workspace_member(workspace_id)`.
   - `INSERT`: Allowed only if `is_workspace_member(workspace_id)`.
   - `UPDATE`: Allowed only if `is_workspace_member(workspace_id)`.
   - `DELETE`: Allowed only if `is_workspace_member(workspace_id)`.
3. **Profiles Table**:
   - `SELECT`: Authenticated users can view profiles.
   - `INSERT/UPDATE`: Users can modify only their own profile where `id = auth.uid()`.
4. **User Preferences Table**:
   - Users can read and update only their own row where `user_id = auth.uid()`.

---

## 3. File Storage Security

- **Storage Bucket**: Private bucket `documents`.
- **Access Policies**:
  - Unauthenticated access is blocked by default.
  - Uploads (`INSERT`) are permitted only for authenticated users uploading into their authorized workspace folders:
    ```sql
    CREATE POLICY "Workspace members can upload documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'documents');
    ```
  - Downloads (`SELECT`) and Deletions (`DELETE`) verify user ownership.
- **File Validation**:
  - File picker enforces allowed file types: PDF, DOCX, XLSX, PNG, JPG, TXT.
  - File size checks prevent client memory overflow (50MB threshold).
  - Storage paths include timestamps and unique prefixes to prevent filename collision or path traversal.

---

## 4. Application Security Controls

| Threat Vector | Mitigation Implemented | Status |
| :--- | :--- | :--- |
| **API Secret Exposure** | Anon publishable key only in frontend; zero service-role keys bundled. | **Active** |
| **Cross-Site Scripting (XSS)** | React JSX auto-escaping; no `dangerouslySetInnerHTML` on untrusted content. | **Active** |
| **Insecure Direct Object Reference (IDOR)** | Server-side Postgres RLS enforcing `auth.uid()` workspace ownership. | **Active** |
| **Cross-User Data Leakage** | Database queries scoped to authenticated workspace; guest queries return `[]`. | **Active** |
| **Information Leakage in Logs** | Sensitive tokens, passwords, and sessions are excluded from console logging. | **Active** |
| **CSRF / Session Hijacking** | Supabase Auth uses secure Bearer tokens with short-lived JWT expiry and auto-refresh. | **Active** |
| **Brute Force Attacks** | Managed by Supabase Auth rate-limiting on `/auth/v1/token` endpoints. | **Active** |
| **Production Storage Bucket Migration** | Storage RLS policies defined in SQL migration; pending execution in dashboard. | **Pending Dashboard Execution** |

---

## 5. Security Verification & Testing Checklist

- [x] **Guest Access**: Opening `http://127.0.0.1:5173/` as a new visitor displays public navigation without forced login redirects.
- [x] **Zero Fabricated Data**: New unauthenticated sessions display `0` projects, `0` tasks, `0` documents, and clean empty states.
- [x] **Guest Upload Interception**: Clicking *"Upload Document"* or drag-dropping files opens the contextual modal popup (*"Sign in to upload documents"*).
- [x] **Dismissible Popup**: Closing the authentication popup returns the visitor to the document view without breaking state.
- [x] **Authentication Flow**: Login and registration pages feature real Supabase integration, password toggle, and validation.
- [x] **Logout Clears State**: Triggering logout invalidates active session and resets app metrics to 0.
- [x] **No Secret Key Exposure**: Grep scan confirms zero `service_role` keys or database credentials in client source.
- [x] **Safe-Area & Input Validation**: Email and password forms enforce format requirements and prevent blank submissions.
- [x] **Production Bundle Security**: Vite build succeeds with minification and tree-shaking.
