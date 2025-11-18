# Deployment Guide for InsideLab Frontend

## Overview
This guide covers deploying the InsideLab Flutter web application to various hosting platforms.

## Quick Deploy to GitHub Pages

### Prerequisites
- GitHub repository with push access
- Flutter SDK installed locally

### Automatic Deployment (Recommended)

1. **GitHub Actions Setup**
   - The repository includes `.github/workflows/deploy.yml`
   - Pushes to `main` branch automatically trigger deployment
   - No manual intervention required

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Set Source to "GitHub Actions"
   - Your site will be available at: `https://your-username.github.io/your-repo-name/`

### Manual Deployment

```bash
# Build for production
flutter build web --web-renderer html --base-href "/your-repo-name/"

# The built files will be in build/web/
# Upload these files to your hosting provider
```

## Alternative Hosting Options

### 1. Netlify
1. Connect your GitHub repository
2. Set build command: `flutter build web --web-renderer html`
3. Set publish directory: `build/web`
4. Deploy automatically on git push

### 2. Vercel
1. Import your GitHub repository
2. Set framework preset to "Other"
3. Build command: `flutter build web --web-renderer html`
4. Output directory: `build/web`

### 3. Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
flutter build web --web-renderer html
firebase deploy
```

## Configuration for Production

### Environment Setup
- Development: Uses local backend at `http://127.0.0.1:8000`
- Production: Configure backend URL in `lib/config/environment.dart`

### API Configuration
Update the production API URL in `environment.dart`:
```dart
static const String _prodApiUrl = 'https://your-backend-domain.com/api/v1';
```

### Custom Domain (Optional)
1. Add CNAME record pointing to your hosting provider
2. Update `cname` in the GitHub Actions workflow
3. Enable HTTPS in your hosting platform settings

## MVP Deployment Notes

For MVP deployment without backend:
1. Set `_prodApiUrl` to demo/mock API endpoint
2. Disable authentication features in environment flags
3. Use static data for demonstration purposes

## Troubleshooting

### Common Issues
- **Base href errors**: Ensure base-href matches your deployment path
- **CORS issues**: Configure your backend to allow requests from your domain
- **Asset loading**: Check that all assets are included in build/web
- **Routing issues**: Ensure your hosting provider supports SPA routing

### Build Optimization
```bash
# Optimize for production
flutter build web --web-renderer html --release --dart-define=FLUTTER_WEB_USE_SKIA=false
```

## Security Considerations

1. **API Keys**: Never commit sensitive API keys to the repository
2. **Environment Variables**: Use build-time variables for configuration
3. **HTTPS**: Always use HTTPS in production
4. **CSP Headers**: Configure Content Security Policy headers