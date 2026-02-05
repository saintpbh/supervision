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
    fullTranscript: ''
};
