export interface ReportData {
    // Step 1: Core
    coreQuestion: string; // "Why this case? / What is the uncomfortable point?"

    // Step 2: Facts (A)
    counselorName: string;
    clientName: string; // Initials
    clientAgeGender: string;
    counselingCount: string;
    triggerEvent: string;
    chiefComplaint: string;
    familyRelations: string; // Brief summary
    socialContext: string; // Job/School

    // Step 3: Judgment (B)
    patternObservation: string; // "Repetitive pattern of..."
    synthesis: string; // "Interaction between trait and stress..."
    consideredIntervention: string; // "Although X was considered..."
    selectedIntervention: string; // "...Y was prioritized"
    hesitationReason: string; // "Counselor experienced hesitation because..."
    counselingGoal: string; // "Focus on..."

    // Step 4: Evidence (C & D)
    sessionSummary: string;
    verbatim: string; // Dialogue
    supervisionQuestions: string; // 1-2 questions
    // New fields for Dual Mode
    reportMode: 'efficiency' | 'academic';
    fullTranscript?: string;
}

export const initialReportData: ReportData = {
    reportMode: 'efficiency',
    coreQuestion: '',
    counselorName: '',
    clientName: '',
    clientAgeGender: '',
    counselingCount: '',
    triggerEvent: '',
    chiefComplaint: '',
    familyRelations: '',
    socialContext: '',
    patternObservation: '',
    synthesis: '',
    consideredIntervention: '',
    selectedIntervention: '',
    hesitationReason: '',
    counselingGoal: '',
    sessionSummary: '',
    verbatim: '',
    supervisionQuestions: '',
};
