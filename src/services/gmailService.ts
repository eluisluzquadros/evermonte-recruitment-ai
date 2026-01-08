import { getAccessToken } from "./authService";

export interface EmailSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  date: string;
  from: string;
}

const checkAuth = () => {
    const token = getAccessToken();
    if (!token) throw new Error("Usuário não autenticado. Faça login com Google.");
    return token;
};

export const requestGmailAccess = async (): Promise<void> => {
    // This function is kept for interface compatibility but logic is handled in App/AuthService
    // In the new flow, we check if we have a token.
    const token = getAccessToken();
    if (!token) throw new Error("User not logged in");
};

export const listEmails = async (query: string = 'subject:(transcript OR transcrição OR meeting)'): Promise<EmailSummary[]> => {
  const accessToken = checkAuth();

  // 1 month ago
  const date = new Date();
  date.setMonth(date.getMonth() - 6);
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '/');
  const finalQuery = `${query} after:${dateStr}`;

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(finalQuery)}&maxResults=15`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) throw new Error("Falha ao listar e-mails");

  const data = await response.json();
  if (!data.messages) return [];

  const detailedEmails = await Promise.all(
    data.messages.map(async (msg: any) => {
      const details = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const detailJson = await details.json();
      
      const headers = detailJson.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(Sem Assunto)';
      const dateVal = headers.find((h: any) => h.name === 'Date')?.value || '';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';

      return {
        id: msg.id,
        threadId: msg.threadId,
        snippet: detailJson.snippet,
        subject,
        date: dateVal,
        from
      };
    })
  );

  return detailedEmails;
};

const decodeBase64 = (data: string) => {
    if (!data) return "";
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
};

export const getEmailFullText = async (messageId: string): Promise<string> => {
    const accessToken = checkAuth();

    const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await response.json();

    let body = "";

    const extractText = (payload: any): string => {
        if (payload.mimeType === "text/plain" && payload.body && payload.body.data) {
            return decodeBase64(payload.body.data);
        }
        if (payload.parts) {
            for (const part of payload.parts) {
                const text = extractText(part);
                if (text) return text;
            }
        }
        return "";
    };

    body = extractText(data.payload);
    if (!body) body = data.snippet; // Fallback to snippet if body parsing fails

    return body;
};

export const isDemoMode = () => false;