'use client';

import React from 'react';

interface TranscriptModalProps {
    reportMode: string;
    transcriptText: string;
    setTranscriptText: (text: string) => void;
    uploadedFile: { data: string, mimeType: string } | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setUploadedFile: (file: { data: string, mimeType: string } | null) => void;
    onAnalyze: () => void;
    onClose: () => void;
    isAnalyzing: boolean;
    onUpdateReportMode: (mode: 'efficiency' | 'academic') => void;
    counselingTheory: string;
    onUpdateTheory: (theory: 'none' | 'psychoanalysis' | 'object-relations' | 'cbt' | 'humanistic' | 'gestalt') => void;
}

export default function TranscriptModal({
    reportMode,
    transcriptText,
    setTranscriptText,
    uploadedFile,
    handleFileChange,
    setUploadedFile,
    onAnalyze,
    onClose,
    isAnalyzing,
    onUpdateReportMode,
    counselingTheory,
    onUpdateTheory
}: TranscriptModalProps) {
    const theories = [
        { id: 'none', label: '자율 선택', icon: '🤖' },
        { id: 'psychoanalysis', label: '정신분석', icon: '🛋️' },
        { id: 'object-relations', label: '대상관계', icon: '👥' },
        { id: 'cbt', label: 'CBT', icon: '⚙️' },
        { id: 'humanistic', label: '인간중심', icon: '🌱' },
        { id: 'gestalt', label: '게슈탈트', icon: '🧩' },
    ];

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card glass-card" style={{ width: '90%', maxWidth: '750px', maxHeight: '95vh', overflow: 'hidden', padding: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ padding: '2rem', overflowY: 'auto', maxHeight: '90vh' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 900 }}>축어록 자동 분석</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>1. 보고서 유형 선택</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="glass-panel"
                                onClick={() => onUpdateReportMode('efficiency')}
                                style={{
                                    flex: 1, padding: '0.75rem', border: reportMode === 'efficiency' ? '2px solid var(--secondary)' : '1px solid var(--border)',
                                    background: reportMode === 'efficiency' ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                                    textAlign: 'center', cursor: 'pointer', borderRadius: '12px', transition: 'var(--transition)'
                                }}
                            >
                                <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>⚡️</div>
                                <div style={{ fontWeight: 700, color: reportMode === 'efficiency' ? 'var(--secondary)' : 'var(--text-primary)' }}>핵심형</div>
                            </button>
                            <button
                                className="glass-panel"
                                onClick={() => onUpdateReportMode('academic')}
                                style={{
                                    flex: 1, padding: '0.75rem', border: reportMode === 'academic' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: reportMode === 'academic' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    textAlign: 'center', cursor: 'pointer', borderRadius: '12px', transition: 'var(--transition)'
                                }}
                            >
                                <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🎓</div>
                                <div style={{ fontWeight: 700, color: reportMode === 'academic' ? 'var(--primary)' : 'var(--text-primary)' }}>표준형</div>
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>2. 상담 이론 프레임워크 (관점 선택)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            {theories.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onUpdateTheory(t.id as any)}
                                    style={{
                                        padding: '0.6rem', border: counselingTheory === t.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: counselingTheory === t.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.05)',
                                        textAlign: 'center', cursor: 'pointer', borderRadius: '8px', transition: 'var(--transition)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    <span style={{ fontSize: '1rem' }}>{t.icon}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: counselingTheory === t.id ? 'var(--primary)' : 'var(--text-muted)' }}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>3. 데이터 입력 (파일 또는 텍스트)</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <label
                                className="btn btn-secondary"
                                style={{ cursor: 'pointer', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>📁</span> 업로드
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                            {uploadedFile && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                                    ✅ {uploadedFile.mimeType.split('/')[1].toUpperCase()}
                                    <button
                                        onClick={() => setUploadedFile(null)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: '6px', cursor: 'pointer' }}
                                    >
                                        삭제
                                    </button>
                                </span>
                            )}
                        </div>
                        <textarea
                            className="textarea"
                            style={{ minHeight: '200px', fontSize: '0.9rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            value={transcriptText}
                            onChange={e => setTranscriptText(e.target.value)}
                            placeholder="(상담자): 안녕하세요.&#10;(내담자): 네, 안녕하세요..."
                        />
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn btn-secondary" style={{ borderRadius: '10px', padding: '0.6rem 1.5rem' }} onClick={() => { onClose(); setUploadedFile(null); }}>취소</button>
                        <button className="btn btn-primary" style={{ borderRadius: '10px', padding: '0.6rem 2rem' }} onClick={onAnalyze} disabled={isAnalyzing || (!transcriptText.trim() && !uploadedFile)}>
                            {isAnalyzing ? '데이터 분석 중...' : '분석 및 자동 완성'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
