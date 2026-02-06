export interface ReportData {
    id?: string; // Optional ID for saving
    reportMode: 'efficiency' | 'academic';
    counselorName: string;
    clientName: string;
    clientAgeGender: string;
    counselingCount: string;

    // Step 2: Facts
    triggerEvent: string;
    chiefComplaint: string;
    familyRelations: string; // Only for Academic
    socialContext: string; // Only for Academic

    // Step 3: Professional Judgment
    patternObservation: string;
    coreQuestion: string; // Key Difficulty
    hesitationReason: string; // Counter-transference
    synthesis: string; // Case Conceptualization

    // Restored fields used in components
    consideredIntervention?: string;
    selectedIntervention?: string;
    counselingGoal?: string;
    supervisionQuestions?: string;

    // Step 4: Transcript
    verbatim: string; // Key Dialogue (Efficiency) or Full Transcript (Academic)
    sessionSummary?: string; // Optional summary
    fullTranscript?: string; // Explicit field for full transcript if needed separate

    // Psychological Testing (New)
    sctData?: string; // Sentence Completion Test
    mmpiData?: string; // MMPI-2 profile/results
    sctInterpretation?: string; // AI interpretation of SCT
    mmpiAnalysis?: string; // AI interpretation of MMPI-2

    // Phase 2: Theory Integration
    counselingTheory?: 'none' | 'psychoanalysis' | 'object-relations' | 'cbt' | 'humanistic' | 'gestalt';
}

export interface ReportEntry {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    status: 'draft' | 'completed';
    mode: 'efficiency' | 'academic';
    data: ReportData;
}

export const stepsList = [
    { id: 1, title: '핵심 요구', icon: '❓' },
    { id: 2, title: '내담자 정보', icon: '📄' },
    { id: 3, title: '사례 개념화', icon: '🧠' },
    { id: 4, title: '최종 검토', icon: '✅' }
];

export const initialReportData: ReportData = {
    reportMode: 'efficiency',
    counselorName: '',
    clientName: '',
    clientAgeGender: '',
    counselingCount: '',

    triggerEvent: '',
    chiefComplaint: '',
    familyRelations: '',
    socialContext: '',

    patternObservation: '',
    coreQuestion: '',
    hesitationReason: '',
    synthesis: '',

    consideredIntervention: '',
    selectedIntervention: '',
    counselingGoal: '',
    supervisionQuestions: '',

    verbatim: '',
    sessionSummary: '',
    fullTranscript: '',
    sctData: '',
    mmpiData: '',
    sctInterpretation: '',
    mmpiAnalysis: '',
    counselingTheory: 'none'
};
