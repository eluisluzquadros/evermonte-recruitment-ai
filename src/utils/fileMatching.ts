
// Normalizes text: lower case, remove accents
const normalize = (str: string) => {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};

export type DocType = 'lensMini' | 'competency' | 'leadership';

interface MatchResult {
    candidateName: string;
    docType: DocType;
}

export const matchFileToCandidate = (
    filename: string, 
    candidates: string[]
): MatchResult | null => {
    const normalizedFilename = normalize(filename);

    // 1. Identify Document Type based on keywords
    let docType: DocType | null = null;

    if (normalizedFilename.includes('lens') || normalizedFilename.includes('personalidade') || normalizedFilename.includes('personality')) {
        docType = 'lensMini';
    } else if (normalizedFilename.includes('competenc') || normalizedFilename.includes('skills')) {
        docType = 'competency';
    } else if (normalizedFilename.includes('lider') || normalizedFilename.includes('leader') || normalizedFilename.includes('gestao')) {
        docType = 'leadership';
    }

    // If we can't identify the type, we can't auto-assign (safest approach)
    if (!docType) return null;

    // 2. Identify Candidate
    // We look for the candidate name that has the most overlap with the filename
    let bestMatch: string | null = null;
    let maxOverlap = 0;

    for (const candidate of candidates) {
        const normalizedCandidate = normalize(candidate);
        const nameParts = normalizedCandidate.split(' ').filter(p => p.length > 2); // Filter out "de", "da"
        
        let matches = 0;
        for (const part of nameParts) {
            if (normalizedFilename.includes(part)) {
                matches++;
            }
        }

        // Heuristic: At least one significant name part must match. 
        // Prefer matches with more parts (First + Last name).
        if (matches > 0 && matches > maxOverlap) {
            maxOverlap = matches;
            bestMatch = candidate;
        }
    }

    if (bestMatch) {
        return { candidateName: bestMatch, docType };
    }

    return null;
};
