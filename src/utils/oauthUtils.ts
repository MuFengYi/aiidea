// OAuth utility functions for Google and Apple Sign In

import { AuthTokens } from "../services/api";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (parent: Element, options: any) => void;
        };
      };
    };
    AppleID: {
      auth: {
        init: (config: any) => void;
        signIn: (config?: any) => Promise<any>;
      };
    };
  }
}

interface AuthResult {
  tokens: AuthTokens
  user: {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    language: string;
    timezone: string;
    currency: string;
    createdAt: string;
    lastLoginAt: string;
  };
}

export const initializeGoogleSignIn = (): Promise<AuthResult | null> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Sign-In not loaded'));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        try {
          // Send the credential to your backend
          const result = await fetch('/api/v1/auth/google/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              credential: response.credential
            })
          });

          if (result.ok) {
            const data = await result.json();
            resolve(data);
          } else {
            reject(new Error('Google authentication failed'));
          }
        } catch (error) {
          reject(error);
        }
      }
    });

    window.google.accounts.id.prompt();
  });
};

export const initializeAppleSignIn = (): Promise<AuthResult | null> => {
  return new Promise((resolve, reject) => {
    if (!window.AppleID) {
      reject(new Error('Apple Sign-In not loaded'));
      return;
    }

    window.AppleID.auth.init({
      clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
      scope: 'name email',
      redirectURI: `${window.location.origin}/auth/apple/callback`,
      state: 'origin:web',
      usePopup: true
    });

    window.AppleID.auth.signIn()
      .then(async (data: any) => {
        try {
          // Send the authorization code to your backend
          const result = await fetch('/api/v1/authApp/apple/web', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              identityToken: data.authorization.id_token,
              name: data.user?.name
                ? { givenName: data.user.name.firstName, familyName: data.user.name.lastName }
                : undefined,
              platform: "web",
            })
          });

          if (result.ok) {
            const authData = await result.json();
            resolve(authData);
          } else {
            reject(new Error('Apple authentication failed'));
          }
        } catch (error) {
          reject(error);
        }
      })
      .catch(reject);
  });
};

// Alternative approach using direct API calls
export const signInWithGoogle = async (): Promise<void> => {
  const redirectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/auth/google`;
  window.location.href = redirectUrl;
};

export const signInWithApple = async (): Promise<void> => {
  const redirectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/auth/apple`;
  window.location.href = redirectUrl;
};
