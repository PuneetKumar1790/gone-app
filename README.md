# Gone - Year Progress Tracker

A minimal web app that tracks the current year's progress and sends push notifications when each percent is completed. Built with React PWA frontend and Azure Functions serverless backend.

## 📱 Installation

**Install as a Progressive Web App (PWA) for the best experience:**

### Android (Brave/Chrome)
1. Visit **https://puneetk.dev** in Brave or Chrome
2. Tap the **menu** (⋮) → **"Add to Home screen"** or **"Install app"**
3. Tap **"Install"** or **"Add"**
4. Open the app from your home screen
5. Enable notifications when prompted

### iOS (Safari)
1. Visit **https://puneetk.dev** in Safari
2. Tap the **Share** button (□↑)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. Open the app from your home screen
6. Enable notifications when prompted

> **Note:** On iOS, notifications only work when the app is installed to the home screen (PWA mode), not in regular Safari.

---

## 🎯 Core Concept

Time passes irreversibly. This app tracks how much of the current year is already gone and notifies you only when another 1% is completed. No gamification, no social features—just cold, factual awareness.

## ✨ Features

- **Real-time Progress**: View current year completion percentage
- **Smart Notifications**: Get notified only when crossing whole percent thresholds
- **Timezone-Aware**: Accurate calculations based on your timezone
- **Minimal Design**: Black, white, grey—nothing more
- **PWA**: Works offline, installable on any device
- **Privacy-First**: No tracking, no unnecessary data collection

## 🏗️ Architecture

### Frontend
- **React + Vite**: Fast, modern build tooling
- **Tailwind CSS**: Minimal, utility-first styling
- **PWA**: Service worker, offline support, installable
- **Web Push API**: Native browser notifications

### Backend
- **Azure Functions**: Serverless, pay-per-execution
- **MongoDB Atlas**: Free tier database (M0 cluster)
- **Web Push (VAPID)**: Push notification delivery
- **Node.js**: Runtime environment

### Functions
1. **Timer Trigger** (`checkYearProgress`): Runs hourly, checks all users, sends notifications
2. **GET `/api/progress`**: Returns current year progress for any timezone
3. **POST `/api/subscribe`**: Registers push subscription
4. **PUT `/api/settings`**: Updates user preferences (timezone, notifications)

## 📦 Project Structure

```
gone/
├── frontend/                # React PWA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API & push notification services
│   │   ├── utils/           # Helper functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/
│   │   └── icons/           # PWA icons
│   ├── vite.config.js       # Vite + PWA config
│   └── package.json
│
├── backend/                 # Azure Functions
│   ├── checkYearProgress/   # Timer trigger function
│   ├── getCurrentProgress/  # HTTP: GET progress
│   ├── registerPushSubscription/  # HTTP: POST subscribe
│   ├── updateSettings/      # HTTP: PUT settings
│   ├── shared/              # Shared utilities
│   │   ├── database.js      # MongoDB connection
│   │   ├── yearProgress.js  # Progress calculations
│   │   └── pushService.js   # Push notifications
│   ├── host.json
│   └── package.json
│
└── .github/workflows/       # CI/CD
    └── deploy.yml
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Azure Functions Core Tools (v4)
- MongoDB Atlas account (free tier)
- VAPID keys for push notifications

### 1. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Save the output—you'll need both public and private keys.

### 2. Setup MongoDB Atlas

1. Create free M0 cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user with read/write permissions
3. Whitelist your IP address (or `0.0.0.0/0` for development)
4. Get connection string (replace `<password>` with your password)

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_URI": "mongodb+srv://user:pass@cluster.mongodb.net/gone",
    "VAPID_PUBLIC_KEY": "YOUR_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY": "YOUR_PRIVATE_KEY",
    "VAPID_SUBJECT": "mailto:your-email@example.com"
  }
}
```

Start backend:
```bash
npm start
# Backend runs on http://localhost:7071
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_API_BASE_URL=http://localhost:7071/api
VITE_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY
```

Start frontend:
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

## 🌐 Azure Deployment

### 1. Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name gone-rg --location eastus

# Create Function App (Consumption plan)
az functionapp create \
  --resource-group gone-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name gone-functions \
  --storage-account gonefunctionsstorage

# Create Static Web App
az staticwebapp create \
  --name gone-app \
  --resource-group gone-rg \
  --location eastus \
  --source https://github.com/YOUR_USERNAME/gone \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"
```

### 2. Configure Function App Environment Variables

```bash
az functionapp config appsettings set \
  --name gone-functions \
  --resource-group gone-rg \
  --settings \
    MONGODB_URI="your_mongodb_connection_string" \
    VAPID_PUBLIC_KEY="your_public_key" \
    VAPID_PRIVATE_KEY="your_private_key" \
    VAPID_SUBJECT="mailto:your-email@example.com"
```

### 3. Setup GitHub Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

- `AZURE_STATIC_WEB_APPS_API_TOKEN`: From Static Web App deployment token
- `AZURE_FUNCTIONAPP_NAME`: `gone-functions`
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`: Download from Azure Portal
- `VITE_API_BASE_URL`: `https://gone-functions.azurewebsites.net/api`
- `VITE_VAPID_PUBLIC_KEY`: Your VAPID public key

### 4. Deploy

Push to `main` branch—GitHub Actions will automatically deploy both frontend and backend.

## 🧪 Testing

### Test Year Progress Calculation

```bash
cd backend
node -e "
const { getYearProgressData } = require('./shared/yearProgress.js');
console.log(getYearProgressData('Asia/Kolkata', 2026));
"
```

### Test Push Notification (Local)

Use a tool like [Pushpad](https://web-push-codelab.glitch.me/) or curl to test the `/api/subscribe` endpoint.

### Manual Testing Checklist

- [ ] Landing page loads with correct copy
- [ ] "Enable Notifications" requests permission
- [ ] Permission granted → redirects to dashboard
- [ ] Dashboard shows correct progress percentage
- [ ] Progress bar fills to correct width
- [ ] All metrics display correctly (days passed/remaining, next notification %)
- [ ] Settings panel opens and closes
- [ ] Timezone can be updated
- [ ] Notifications can be toggled
- [ ] PWA can be installed
- [ ] App works offline
- [ ] Notification arrives when threshold crossed (wait or test with modified backend)

## 💰 Cost Estimation

**Azure Functions (Consumption Plan)**
- ~3.65 million executions/year (1 user, hourly checks)
- First 1M executions free
- Cost: **$0/month** for <100 users

**Azure Static Web Apps**
- Free tier: 100GB bandwidth, custom domains
- Cost: **$0/month**

**MongoDB Atlas**
- M0 cluster: 512MB storage, shared CPU
- Cost: **$0/month**

**Total: ~$0/month** for MVP (scales affordably)

## 🔐 Security

- CORS restricted to frontend domain only
- Rate limiting recommended (Azure API Management)
- VAPID keys stored in Azure Key Vault (production)
- MongoDB connection uses TLS encryption
- No PII collected beyond timezone and push subscription

## 📊 Monitoring

- Application Insights for Azure Functions (included)
- Monitor notification delivery success rates
- Track expired subscriptions cleanup
- Alert on function failures

## 🐛 Troubleshooting

### Notifications not working locally

- Ensure HTTPS (use `localhost` or ngrok)
- Check browser console for service worker errors
- Verify VAPID keys match in frontend and backend
- Test with browser's push notification tester

### Timer trigger not firing

- Check `checkYearProgress/function.json` cron expression
- Verify function app is running (not stopped)
- Check Application Insights for errors
- Ensure MongoDB connection is valid

### Progress calculation wrong

- Verify timezone is valid IANA format
- Check leap year logic (2024, 2028, etc.)
- Test with known dates and timezones

## 🤝 Contributing

This is a minimal, focused app. Contributions welcome for:
- Bug fixes
- Performance improvements
- Security enhancements

Not accepting:
- Gamification features
- Social features
- Motivational copy changes
- Unnecessary complexity

## � Why This Exists

Got a random idea one day and decided to build it. Thought others might find it useful too.

## 📄 License

MIT
