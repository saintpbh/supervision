import { getReports, saveReport } from './storage';
import { ReportEntry } from './types';

export function exportData() {
    const reports = getReports();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().slice(0, 10);
    downloadAnchorNode.setAttribute("download", `hanamindcare_backup_${date}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

export async function importData(file: File): Promise<{ success: boolean; count: number; message: string }> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const importedReports = JSON.parse(json);

                if (!Array.isArray(importedReports)) {
                    resolve({ success: false, count: 0, message: "Invalid file format: Not an array." });
                    return;
                }

                let count = 0;
                const existingReports = getReports();
                const existingIds = new Set(existingReports.map(r => r.id));

                importedReports.forEach((entry: any) => {
                    // Basic validation
                    if (entry.id && entry.data) {
                        // Strategy: If ID exists, skip (don't overwrite unless we ask? For now, skip safe)
                        // OR: User might want to restore old version.
                        // Let's Skip if ID exists to avoid accidental overwrite of newer work.
                        if (!existingIds.has(entry.id)) {
                            saveReport(entry.data, entry.status || 'draft');
                            count++;
                        }
                    }
                });

                resolve({ success: true, count, message: `${count} reports imported successfully.` });

            } catch (e) {
                console.error(e);
                resolve({ success: false, count: 0, message: "Failed to parse JSON file." });
            }
        };
        reader.readAsText(file);
    });
}
