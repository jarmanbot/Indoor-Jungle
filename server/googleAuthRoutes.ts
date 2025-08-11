import type { Express } from "express";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

export function setupGoogleAuth(app: Express) {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/auth/google/callback`
  );

  // Start Google OAuth flow
  app.get('/api/auth/google', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
    
    res.redirect(authUrl);
  });

  // Handle OAuth callback
  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Authorization code required' });
      }

      const { tokens } = await oauth2Client.getToken(code);
      
      // Store tokens in session
      (req.session as any).googleTokens = tokens;
      
      // Get user info
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      
      (req.session as any).user = {
        id: userInfo.data.id,
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
      };

      res.redirect('/');
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // Get current user
  app.get('/api/auth/user', (req, res) => {
    const user = (req.session as any)?.user;
    const tokens = (req.session as any)?.googleTokens;
    
    if (!user || !tokens) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    res.json({
      user,
      hasValidTokens: !!(tokens.access_token),
    });
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Middleware to check authentication
  app.use('/api/plants', (req, res, next) => {
    const tokens = (req.session as any)?.googleTokens;
    if (!tokens) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  });
}