declare global {
  interface Window {
    pdfjsLib: any;
    mammoth: any;
  }
}

export const parseFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    if (extension === 'pdf') {
      return await parsePdf(file);
    } else if (extension === 'docx') {
      return await parseDocx(file);
    } else {
      // Default to text parsing for txt, md, csv, json, etc.
      return await parseText(file);
    }
  } catch (error) {
    console.error("File parsing error:", error);
    throw new Error(`Failed to parse ${extension?.toUpperCase()} file. Ensure it is not corrupted.`);
  }
};

const parseText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string || "");
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

const parsePdf = async (file: File): Promise<string> => {
  if (!window.pdfjsLib) throw new Error("PDF.js library not loaded");

  const arrayBuffer = await file.arrayBuffer();
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

const parseDocx = async (file: File): Promise<string> => {
  if (!window.mammoth) throw new Error("Mammoth.js library not loaded");

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  return result.value; // The raw text
};