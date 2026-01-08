// Interface for Google Identity Services
declare global {
    interface Window {
        google: any;
    }
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

interface UserProfile {
    name: string;
    email: string;
    picture: string;
}

let tokenClient: any;
let accessToken: string | null = null;
let userProfile: UserProfile | null = null;

// Helper to wait for the Google Script to load
const waitForGoogleScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        // Check if script is already loaded
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            resolve(true);
            return;
        }

        console.log("Waiting for Google Script...");
        let retries = 0;
        const interval = setInterval(() => {
            if (window.google && window.google.accounts && window.google.accounts.oauth2) {
                clearInterval(interval);
                resolve(true);
            }
            retries++;
            if (retries > 50) { // Wait up to 5 seconds
                clearInterval(interval);
                console.warn("Google Identity Services script failed to load. Auth features disabled.");
                resolve(false);
            }
        }, 100);
    });
};

// Initialize the Token Client
export const initGoogleAuth = (): boolean => {
    // Safe check for CLIENT_ID - Log warning instead of error on startup
    if (!CLIENT_ID || CLIENT_ID === "YOUR_CLIENT_ID_HERE" || CLIENT_ID.trim() === "") {
        console.warn("Google Client ID is not configured. Authentication features will be disabled.");
        return false;
    }

    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        // Avoid re-initializing if already done and valid
        if (tokenClient) return true;

        try {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (resp: any) => {
                    // Default callback placeholder
                    if (resp.error) {
                        console.error("Auth Callback Error:", resp);
                    }
                },
            });
            return true;
        } catch (e) {
            console.error("Error initializing token client:", e);
            return false;
        }
    }
    return false;
};

// Trigger the login popup
export const signInWithGoogle = async (): Promise<string> => {
    // 0. Check configuration first - STRICT check here when user clicks login
    if (!CLIENT_ID || CLIENT_ID === "YOUR_CLIENT_ID_HERE" || CLIENT_ID.trim() === "") {
        throw new Error("Google Sign-In is not configured. Please add GOOGLE_CLIENT_ID to your .env file.");
    }

    // 1. Ensure script is loaded
    const scriptLoaded = await waitForGoogleScript();
    if (!scriptLoaded) {
        throw new Error("Google API unavailable (Script failed to load). Check internet or ad-blockers.");
    }

    return new Promise((resolve, reject) => {
        // 2. Initialize if missing
        if (!tokenClient) {
            const success = initGoogleAuth();
            if (!success) {
                reject(new Error("Failed to initialize Google Auth Client. Check Client ID configuration."));
                return;
            }
        }

        // 3. Safety check again - Explicit guard against undefined
        if (!tokenClient) {
            reject(new Error("Critical Error: Google Token Client is undefined despite initialization attempt."));
            return;
        }

        // 4. Overwrite callback for this specific request to capture resolution
        try {
            // Define the callback on the existing client instance
            tokenClient.callback = async (resp: any) => {
                if (resp.error) {
                    console.error("Google Auth Error:", resp);
                    reject(new Error(`Google Auth Failed: ${resp.error}`));
                } else if (resp.access_token) {
                    accessToken = resp.access_token;
                    await fetchUserProfile();
                    resolve(accessToken!);
                } else {
                    reject(new Error("No access token received."));
                }
            };

            // 5. Request Token
            // Note: requestAccessToken does not return a promise, result comes via callback
            tokenClient.requestAccessToken({ prompt: 'consent' });

        } catch (error: any) {
            console.error("SignIn Error:", error);
            reject(new Error(`Error triggering login: ${error.message}`));
        }
    });
};

// Fetch user info
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
    if (!accessToken) return null;

    try {
        const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (res.status === 401) {
            // Token expired
            accessToken = null;
            userProfile = null;
            return null;
        }

        if (res.ok) {
            userProfile = await res.json();
            return userProfile;
        }
    } catch (e) {
        console.error("Error fetching profile", e);
    }
    return null;
};

export const getAccessToken = () => accessToken;
export const getUserProfile = () => userProfile;
export const isAuthenticated = () => !!accessToken;

export const signOut = () => {
    if (accessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
        try {
            window.google.accounts.oauth2.revoke(accessToken, () => {
                console.log('Access token revoked');
            });
        } catch (e) {
            // Ignore if revocation fails
        }
    }
    accessToken = null;
    userProfile = null;
};