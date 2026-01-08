import { getAccessToken } from "./authService";

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    iconLink: string;
}

// Helper to check if we should try real API or fallback (though now we prioritize real API)
const checkAuth = () => {
    const token = getAccessToken();
    if (!token) throw new Error("Usuário não autenticado. Faça login com Google.");
    return token;
};

export const listDriveFiles = async (): Promise<DriveFile[]> => {
    const token = checkAuth();

    // Query to filter for Documents, PDFs, Text files, avoiding folders
    const query = "mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType = 'text/plain'";
    
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,iconLink,thumbnailLink)&pageSize=20`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
        throw new Error("Falha ao listar arquivos do Drive");
    }

    const data = await response.json();
    return data.files || [];
};

export const getDriveFileContent = async (fileId: string): Promise<string> => {
    const token = checkAuth();

    // First, get file metadata to know the mimeType
    const metaResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const meta = await metaResponse.json();

    let url = '';
    let isBinary = false;

    // Handle Google Docs (Export) vs Binary Files (Download)
    if (meta.mimeType === 'application/vnd.google-apps.document') {
        // Export Google Doc to Plain Text
        url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
    } else {
        // Download PDF/DOCX/TXT directly
        url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        isBinary = true;
    }

    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!response.ok) {
        throw new Error("Falha ao baixar arquivo");
    }

    // If it was a Google Doc exported to text, just return text
    if (!isBinary || meta.mimeType === 'text/plain') {
        return await response.text();
    }

    // If it's a binary file (PDF/DOCX), we need to parse it
    // We return the Blob to be handled by the fileParser utility in the frontend
    // However, the service signature expects string. 
    // Ideally, we refactor to return Blob, but to keep it simple, we can try to parse here if we move parsers to service,
    // OR simpler: We assume the component handles the parsing logic if we pass the blob URL or we use a hack.
    // BETTER APPROACH for this architecture:
    // We read the blob, and if it is PDF/DOCX, we need the parser.
    // Since `pdf.js` and `mammoth` are window globals in index.html, we can use them here if we are in browser.
    
    const blob = await response.blob();
    
    // Re-use the window parsers (Logic duplicated from fileParser.ts but adapted for Blob)
    if (meta.mimeType === 'application/pdf') {
        return await parsePdfBlob(blob);
    } else if (meta.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await parseDocxBlob(blob);
    } else {
        return await blob.text();
    }
};

// Helper to parse PDF Blob
const parsePdfBlob = async (blob: Blob): Promise<string> => {
    if (!window.pdfjsLib) throw new Error("PDF.js not loaded");
    const arrayBuffer = await blob.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }
    return fullText;
};

// Helper to parse DOCX Blob
const parseDocxBlob = async (blob: Blob): Promise<string> => {
    if (!window.mammoth) throw new Error("Mammoth.js not loaded");
    const arrayBuffer = await blob.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
};

export const isDriveDemoMode = () => false; // No longer using mock mode by default