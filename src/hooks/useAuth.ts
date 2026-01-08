import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// STRICT ALLOWLIST
const ALLOWED_EMAILS = [
  "lauragirardi@evermonte.com",
  "feliperibeiro@evermonte.com",
  "guilhermeabdala@evermonte.com",
  "eluzquadros@gmail.com",
  "everton@skyvidya.org"
];

const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (isEmailAllowed(firebaseUser.email)) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });
          setError(null);
        } else {
          console.warn(`Unauthorized access attempt by: ${firebaseUser.email}`);
          await signOut(auth);
          setUser(null);
          setError("Acesso negado: Este email não está autorizado a acessar o sistema.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Redirect Result on Mount
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        console.log("getRedirectResult fired. Result:", result);
        if (result) {
          if (isEmailAllowed(result.user.email)) {
            console.log("Redirect login successful! User:", result.user);
            // onAuthStateChanged will handle the state update
          } else {
            console.warn(`Unauthorized redirect login attempt by: ${result.user.email}`);
            await signOut(auth);
            throw new Error("Acesso negado: Email não autorizado.");
          }
        }
      } catch (err: any) {
        console.error("Redirect Result Error:", err);
        setError(err.message);
      }
    };
    handleRedirect();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);

      if (!isEmailAllowed(result.user.email)) {
        await signOut(auth);
        throw new Error("Acesso negado: Email não autorizado.");
      }

      console.log("Popup login successful! User:", result.user);
      return result.user;
    } catch (err: any) {
      console.error("Google Sign In Error:", err);

      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelado. Tente novamente.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup bloqueado. Por favor, permita popups para este site.');
      } else {
        setError(err.message);
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      if (!isEmailAllowed(email)) {
        throw new Error("Acesso negado: Email não autorizado.");
      }

      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Double check just in case
      if (!isEmailAllowed(result.user.email)) {
        await signOut(auth);
        throw new Error("Acesso negado: Email não autorizado.");
      }

      return result.user;
    } catch (err: any) {
      console.error("Email Sign In Error:", err);
      setError(err.message);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      if (!isEmailAllowed(email)) {
        throw new Error("Cadastro não permitido: Email não autorizado.");
      }

      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
      console.error("Sign Up Error:", err);
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!isEmailAllowed(email)) {
        throw new Error("Email não encontrado na base de usuários autorizados.");
      }
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout Error:", err);
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logout
  };
};


