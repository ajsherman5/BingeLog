import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { AuthUser, AuthProvider } from '../types';

// Google OAuth config - you'll need to replace these with your actual credentials
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'bingelog',
});

export async function signInWithApple(): Promise<AuthUser | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const user: AuthUser = {
      id: credential.user,
      email: credential.email || undefined,
      fullName: credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : undefined,
      provider: 'apple',
      createdAt: Date.now(),
    };

    return user;
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // User cancelled
      return null;
    }
    console.error('Apple sign-in error:', error);
    throw error;
  }
}

export async function signInWithGoogle(): Promise<AuthUser | null> {
  try {
    const state = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString()
    );

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: GOOGLE_REDIRECT_URI,
      scopes: ['openid', 'profile', 'email'],
      state,
      responseType: AuthSession.ResponseType.Token,
    });

    const result = await request.promptAsync(discovery);

    if (result.type === 'success' && result.authentication?.accessToken) {
      // Fetch user info from Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${result.authentication.accessToken}`,
          },
        }
      );

      const userInfo = await userInfoResponse.json();

      const user: AuthUser = {
        id: userInfo.id,
        email: userInfo.email,
        fullName: userInfo.name,
        provider: 'google',
        createdAt: Date.now(),
      };

      return user;
    }

    return null;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function isAppleAuthAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return await AppleAuthentication.isAvailableAsync();
}
