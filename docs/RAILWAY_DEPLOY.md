# Deploying to Railway

This guide shows a minimal, fast way to deploy the `fairy-garden-backend` API to Railway.

Prerequisites
- A Railway account and GitHub account
- The backend repo pushed to GitHub

Quick steps
1. Create a new project on Railway and connect your GitHub repository.
2. In the Railway project, add a **Managed MySQL** plugin (Railway's MySQL). Railway will create credentials.
3. In Railway's Environment settings, add the following variables (use values Railway provides for DB):

```
DB_HOST=<railway_db_host>
DB_PORT=<railway_db_port>
DB_USER=<railway_db_user>
DB_PASS=<railway_db_password>
DB_NAME=<railway_db_name>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain
```

4. Configure Railway to use Dockerfile (Railway auto-detects Node, but using Dockerfile makes environment consistent).
5. Deploy. Railway will build and run the container.

Database setup & migrations
- Railway provides a SQL console to run migrations or you can run migrations from your machine using the provided DB credentials.
- Example: run your schema SQL file (if present) or run `mysql` client pointing to Railway DB and execute `schema.sql`.

Railway CLI (optional)
```bash
npm i -g railway
railway login
railway link  # link repo to project
railway up    # deploy local
```

Notes
- Do not commit `.env` with secrets. Use Railway's environment UI to store secrets.
- If you need to run background jobs, set up separate services in Railway.
