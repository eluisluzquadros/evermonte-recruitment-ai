/**
 * Candidate Reports Data
 * 
 * This file contains the report data for candidates including
 * Cognisess reports (personality, competency, leadership).
 */

export interface Report {
    label: string;
    type: 'personality' | 'competency' | 'leadership' | 'full';
    url: string;
}

// Map of candidate ID to their reports
export const candidateReports: Record<number, Report[]> = {
    0: [
        {
            label: 'Lens Mini Report',
            type: 'personality',
            url: '#'
        },
        {
            label: 'Relatório de Competência',
            type: 'competency',
            url: '#'
        },
        {
            label: 'Relatório de Liderança',
            type: 'leadership',
            url: '#'
        }
    ],
    1: [
        {
            label: 'Lens Mini Report',
            type: 'personality',
            url: '#'
        },
        {
            label: 'Relatório de Competência',
            type: 'competency',
            url: '#'
        },
        {
            label: 'Relatório de Liderança',
            type: 'leadership',
            url: '#'
        }
    ],
    2: [
        {
            label: 'Lens Mini Report',
            type: 'personality',
            url: '#'
        },
        {
            label: 'Relatório de Competência',
            type: 'competency',
            url: '#'
        },
        {
            label: 'Relatório de Liderança',
            type: 'leadership',
            url: '#'
        }
    ]
};

export default candidateReports;
