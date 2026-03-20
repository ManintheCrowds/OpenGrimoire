# OpenAtlas — survey & moderation — deployment guide

## 🎯 MVP Focus: Survey & Moderation Only

This deployment guide focuses on the two essential features:
1. **Survey System** - Multi-step survey form
2. **Moderation System** - Admin panel for content approval

## 🚀 Quick Docker Deployment (Recommended for Proxmox VM)

### Prerequisites
- Docker & Docker Compose installed
- Supabase account
- Domain name (optional but recommended)

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd OpenAtlas
```

### Step 2: Environment Setup
Create `.env.local` file:
```bash
# Copy the example and modify
cp .env.example .env.local

# Edit with your Supabase credentials
nano .env.local
```

Required environment variables (use **your** values from Supabase **Project Settings → API** — do not paste real keys into git or tickets):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
# Required in production: GET /api/alignment-context returns 503 Misconfigured if missing/blank.
ALIGNMENT_CONTEXT_API_SECRET=<long-random-secret>
```

Callers (agents, cron, internal tools) must send header `x-alignment-context-key: <same value>` on each request to that route.

See [docs/security/PUBLIC_SURFACE_AUDIT.md](docs/security/PUBLIC_SURFACE_AUDIT.md) for what must never be committed or logged.

### Step 3: Database Setup
1. Go to your Supabase project SQL editor
2. Run the complete schema from `supabase/migrations/20240320000000_initial_schema.sql`
3. Run the RLS fix from `supabase/migrations/20240320000001_fix_moderation_rls.sql`

### Step 4: Deploy with Docker
```bash
# Build and start the application
docker-compose up -d

# Check logs
docker-compose logs -f openatlas-survey
```

### Step 5: Create Admin User
In Supabase Auth dashboard:
1. Create a new user with admin email
2. In Users table, set `user_metadata` to:
   ```json
   {"role": "admin"}
   ```

## 🌐 Access Points

- **Survey Form**: `https://your-domain.com/survey`
- **Admin Panel**: `https://your-domain.com/admin`
- **Main Dashboard**: `https://your-domain.com/`

## ⚡ Minimal File Structure for MVP

Essential files you need:
```
OpenAtlas/
├── src/
│   ├── app/
│   │   ├── api/survey/route.ts           # Survey submission API
│   │   ├── survey/page.tsx               # Survey form page
│   │   ├── admin/page.tsx                # Admin dashboard
│   │   └── login/page.tsx                # Admin login
│   ├── components/
│   │   ├── SurveyForm/                   # Multi-step survey
│   │   ├── AdminPanel/                   # Moderation interface
│   │   └── Layout/                       # Basic layout
│   ├── lib/
│   │   ├── supabase/                     # Database client
│   │   └── hooks/                        # Form hooks
│   └── types/                            # TypeScript definitions
├── supabase/migrations/                  # Database schema
├── package.json                          # Dependencies
├── Dockerfile                            # Docker configuration
├── docker-compose.yml                    # Container orchestration
└── next.config.js                        # Next.js config
```

## 🔧 Configuration for Production

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Let's Encrypt
```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## 🛡️ Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Docs placeholders**: Use opaque placeholders in examples only — see [docs/security/PUBLIC_SURFACE_AUDIT.md](docs/security/PUBLIC_SURFACE_AUDIT.md)
3. **Brain map header**: `NEXT_PUBLIC_BRAIN_MAP_SECRET` is visible in the browser bundle (gate token, not a true secret). Prefer server-only `BRAIN_MAP_SECRET` verification; details in [docs/security/NEXT_PUBLIC_AND_SECRETS.md](docs/security/NEXT_PUBLIC_AND_SECRETS.md)
4. **Database RLS**: Policies are configured for user data protection
5. **Admin Access**: Only users with `role: "admin"` can access moderation
6. **Alignment context API**: With `NODE_ENV=production`, `ALIGNMENT_CONTEXT_API_SECRET` must be set (non-empty). The route uses the service role server-side; without the secret the app refuses to serve reads (503). See API table in [docs/security/PUBLIC_SURFACE_AUDIT.md](docs/security/PUBLIC_SURFACE_AUDIT.md).
7. **HTTPS**: Always use SSL/TLS in production

## 🔍 Monitoring & Maintenance

### Health Checks
```bash
# Check application status
curl -f http://localhost:3000/

# Check Docker containers
docker-compose ps

# View logs
docker-compose logs --tail=100 openatlas-survey
```

### Database Backup
```bash
# Export survey data
# Use Supabase dashboard or API to export data periodically
```

## 🚨 Troubleshooting

### Common Issues
1. **Supabase Connection**: Verify environment variables
2. **Admin Access**: Check user metadata in Supabase Auth
3. **Docker Build**: Ensure all dependencies are in package.json
4. **CORS Issues**: Check NEXT_PUBLIC_APP_URL matches domain

### Debug Mode
```bash
# Run in development mode for debugging
npm run dev
```

## 📊 MVP Features Verification

### Survey System ✅
- Multi-step form with 8 steps
- Data validation with Zod
- Anonymous submission option
- Supabase integration

### Moderation System ✅
- Admin authentication
- Pending responses queue
- Approve/reject functionality
- Notes and tagging

### Missing from MVP
- Data visualization components
- Three.js visualizations
- Advanced analytics
- Export functionality

This MVP focuses purely on data collection and content moderation, ready for immediate deployment. 