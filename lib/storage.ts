import { ReportData, ReportEntry } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'supervision_reports_v1';

export function getReports(): ReportEntry[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        // basic validation could be added here
        return parsed.sort((a: ReportEntry, b: ReportEntry) => b.updatedAt - a.updatedAt);
    } catch (e) {
        console.error('Failed to parse reports', e);
        return [];
    }
}

export function saveReport(data: ReportData, status: 'draft' | 'completed' = 'draft'): ReportEntry {
    const reports = getReports();
    const now = Date.now();

    // Create title based on content
    const title = data.clientName
        ? `${data.clientName} (${data.counselingCount || '회기미정'})`
        : '새로운 보고서';

    let entry: ReportEntry;

    if (data.id) {
        // Update existing
        const index = reports.findIndex(r => r.id === data.id);
        if (index >= 0) {
            entry = {
                ...reports[index],
                title,
                updatedAt: now,
                status,
                mode: data.reportMode,
                data: { ...data } // Copy data
            };
            reports[index] = entry;
        } else {
            // Fallback if ID exists in data but not in storage (rare)
            entry = {
                id: data.id,
                title,
                createdAt: now,
                updatedAt: now,
                status,
                mode: data.reportMode,
                data: { ...data }
            };
            reports.push(entry);
        }
    } else {
        // Create new
        const newId = uuidv4();
        entry = {
            id: newId,
            title,
            createdAt: now,
            updatedAt: now,
            status,
            mode: data.reportMode,
            data: { ...data, id: newId }
        };
        // Update the data object itself to have the ID
        entry.data.id = newId;
        reports.push(entry);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return entry;
}

export function deleteReport(id: string): void {
    let reports = getReports();
    reports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function getReport(id: string): ReportEntry | undefined {
    // Just find from listing for now, optimization not needed for small list
    const reports = getReports();
    return reports.find(r => r.id === id);
}
