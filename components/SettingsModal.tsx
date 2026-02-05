import React, { useState, useEffect } from 'react';
import { exportData, importData } from '../lib/backup';
import { saveDirectoryHandle, getDirectoryHandle } from '../lib/idb';
import { getUsageStats, UsageStats, resetUsageStats } from '../lib/usage';

interface SettingsModalProps {
    onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'data' | 'usage'>('general');
    const [googleApiKey, setGoogleApiKey] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('google_api_key') || '' : ''));
    const [usage, setUsage] = useState<UsageStats | null>(() => (typeof window !== 'undefined' ? getUsageStats() : null));

    // Auto Backup State
    const [backupPath, setBackupPath] = useState<string | null>(null);
    const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState(false);

    const checkBackupHandle = async () => {
        const handle = await getDirectoryHandle();
        if (handle) {
            setBackupPath(handle.name);
            // Check if enabled in localStorage
            const enabled = localStorage.getItem('auto_backup_enabled') === 'true';
            setIsAutoBackupEnabled(enabled);
        }
    };

    useEffect(() => {
        // Initial check for backup handle
        checkBackupHandle();
    }, []);

    const handleResetUsage = () => {
        if (confirm('사용량 통계를 초기화하시겠습니까?')) {
            resetUsageStats();
            setUsage(getUsageStats());
        }
    };

    const saveApiKey = () => {
        localStorage.setItem('google_api_key', googleApiKey);
        alert('API 키가 저장되었습니다.');
    };

    const handleBackup = () => {
        exportData();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (confirm('백업 파일의 데이터로 복구하시겠습니까? (기존 데이터 중 중복되지 않은 항목만 추가됩니다.)')) {
            const result = await importData(file);
            alert(result.message);
            if (result.success) {
                window.location.reload(); // Reload to show new data
            }
        }
        // Reset input
        e.target.value = '';
    };

    const handleSelectFolder = async () => {
        try {
            // @ts-expect-error - File System Access API
            const handle = await window.showDirectoryPicker();
            if (handle) {
                await saveDirectoryHandle(handle);
                setBackupPath(handle.name);
                // Enable by default when folder selected
                localStorage.setItem('auto_backup_enabled', 'true');
                setIsAutoBackupEnabled(true);
                alert(`'${handle.name}' 폴더가 백업 경로로 지정되었습니다.\n1분마다 자동 저장됩니다.`);
            }
        } catch (err) {
            console.error(err);
            // User cancelled or not supported
        }
    };

    const toggleAutoBackup = async () => {
        if (!backupPath) {
            alert('먼저 백업 폴더를 지정해주세요.');
            return;
        }
        const newState = !isAutoBackupEnabled;
        setIsAutoBackupEnabled(newState);
        localStorage.setItem('auto_backup_enabled', String(newState));
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card glass-card" style={{ width: '90%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="gradient-text" style={{ margin: 0, fontSize: '1.3rem' }}>설정 (Settings)</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setActiveTab('general')}
                        style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === 'general' ? 'rgba(99,102,241,0.1)' : 'transparent', color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'general' ? 700 : 400, cursor: 'pointer', transition: 'var(--transition)' }}
                    >
                        🔑 일반 / API
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        style={{ flex: 1, padding: '1rem', border: 'none', borderBottom: activeTab === 'data' ? '3px solid var(--primary)' : 'none', background: activeTab === 'data' ? 'rgba(99,102,241,0.05)' : 'transparent', color: activeTab === 'data' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'data' ? 700 : 400, cursor: 'pointer', transition: 'var(--transition)' }}
                    >
                        💾 백업/복구
                    </button>
                    <button
                        onClick={() => setActiveTab('usage')}
                        style={{ flex: 1, padding: '1rem', border: 'none', borderBottom: activeTab === 'usage' ? '3px solid var(--primary)' : 'none', background: activeTab === 'usage' ? 'rgba(99,102,241,0.05)' : 'transparent', color: activeTab === 'usage' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'usage' ? 700 : 400, cursor: 'pointer', transition: 'var(--transition)' }}
                    >
                        📈 AI 사용량
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                    {activeTab === 'general' && (
                        <div>
                            <p className="step-description">
                                무료로 제공되는 Google API Key를 입력하면<br />
                                서버 설정 없이 바로 AI 기능을 사용할 수 있습니다.
                            </p>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">API Key</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={googleApiKey}
                                    onChange={e => setGoogleApiKey(e.target.value)}
                                    placeholder="AIzaSy..."
                                />
                                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                                    * 키는 브라우저에만 저장되며 서버에 영구 저장되지 않습니다.<br />
                                    * <a href="https://aistudio.google.com/app/apikey" target="_blank" style={{ color: '#4f46e5' }}>여기서 키 발급받기 (무료)</a>
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className="btn btn-primary" onClick={saveApiKey}>저장하기</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div>
                            <p className="step-description" style={{ marginBottom: '1.5rem' }}>
                                작성한 보고서를 백업하고 복구할 수 있습니다.<br />
                                로그인 없이도 안전하게 데이터를 관리하세요.
                            </p>

                            {/* Auto Backup Section (New) */}
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--primary)' }}>🔄 자동 백업 설정 (Beta)</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Chrome/Edge에서 지정된 폴더에 1분마다 자동 저장합니다.<br />
                                    (Google Drive 폴더를 지정하면 클라우드 동기화 가능)
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {backupPath ? `📂 지정된 폴더: ${backupPath}` : '🚫 지정된 폴더 없음'}
                                    </div>
                                    <button onClick={handleSelectFolder} style={{ fontSize: '0.8rem', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                        {backupPath ? '폴더 변경' : '폴더 지정'}
                                    </button>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={isAutoBackupEnabled}
                                        onChange={toggleAutoBackup}
                                        disabled={!backupPath}
                                    />
                                    <span style={{ fontSize: '0.95rem' }}>1분마다 자동 저장 사용</span>
                                </label>
                            </div>

                            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>📤 데이터 백업 (수동)</h4>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                    모든 보고서 데이터를 <code>.json</code> 파일로 다운로드합니다.
                                </p>
                                <button className="btn btn-secondary" onClick={handleBackup} style={{ width: '100%' }}>
                                    📥 백업 파일 다운로드
                                </button>
                            </div>

                            <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>📥 데이터 복구 (가져오기)</h4>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                    백업해둔 <code>.json</code> 파일을 선택하여 복원합니다.
                                </p>
                                <label className="btn btn-secondary" style={{ width: '100%', display: 'inline-block', textAlign: 'center', cursor: 'pointer' }}>
                                    📂 백업 파일 선택...
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                    {activeTab === 'usage' && (
                        <div>
                            <p className="step-description" style={{ marginBottom: '1.5rem' }}>
                                AI 기능을 통한 토큰 사용량 및 대략적인 비용을 확인합니다.
                            </p>

                            {usage && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>누적 토큰</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{usage.totalTokens.toLocaleString()}</div>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>예상 비용 (USD)</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>${usage.estimatedCost.toFixed(4)}</div>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>입력 토큰</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{usage.inputTokens.toLocaleString()}</div>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>출력 토큰</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{usage.outputTokens.toLocaleString()}</div>
                                    </div>
                                </div>
                            )}

                            <div style={{ padding: '1rem', backgroundColor: 'rgba(249, 115, 22, 0.1)', borderRadius: '8px', border: '1px solid var(--secondary)', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                    💡 <strong>Gemini Free Tier 안내:</strong> <br />
                                    Google AI Studio를 통해 발급받은 키는 무료 티어(분당 15회 요청 등) 범위 내에서 비용 발생 없이 사용 가능합니다. 위 비용은 참조용입니다.
                                </p>
                            </div>

                            <button className="btn" onClick={handleResetUsage} style={{ width: '100%', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', fontSize: '0.85rem' }}>
                                통계 초기화하기
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ padding: '1rem', borderTop: '1px solid #eee', textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
}
