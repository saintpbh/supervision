'use client';

import React from 'react';
import { ReportEntry } from '../lib/types';
import SettingsModal from './SettingsModal';

interface DashboardProps {
    reportList: ReportEntry[];
    onStartNew: () => void;
    onStartWithTranscript: () => void;
    onLoadReport: (report: ReportEntry) => void;
    onDeleteReport: (e: React.MouseEvent, id: string) => void;
    showSettingsModal: boolean;
    setShowSettingsModal: (show: boolean) => void;
}

export default function Dashboard({
    reportList,
    onStartNew,
    onStartWithTranscript,
    onLoadReport,
    onDeleteReport,
    showSettingsModal,
    setShowSettingsModal
}: DashboardProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState<'all' | 'draft' | 'completed'>('all');

    const filteredList = reportList.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.data.clientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <main className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ padding: '4rem 0 2rem 0', textAlign: 'center', position: 'relative' }}>
                <button
                    onClick={() => setShowSettingsModal(true)}
                    className="glass-panel"
                    style={{
                        position: 'absolute', top: '1rem', right: 0,
                        border: '1px solid var(--border)', borderRadius: '30px',
                        padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'var(--transition)'
                    }}
                >
                    <span>⚙️</span> Settings
                </button>
                <div style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '30px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Professional Supervision Helper
                </div>
                <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>하나마인드케어</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
                    고급 AI 기술을 활용하여 상담 수퍼비전 보고서를 <br />더 빠르고 전문적으로 작성하세요.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
                    <button className="btn btn-primary" onClick={onStartNew} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                        + 새 보고서 작성하기
                    </button>
                    <button className="btn btn-secondary" onClick={onStartWithTranscript} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                        ✨ 축어록에서 추출하기
                    </button>
                </div>
            </div>

            {showSettingsModal && (
                <SettingsModal onClose={() => setShowSettingsModal(false)} />
            )}

            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>내 문서함</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>총 {filteredList.length}개의 문서가 검색되었습니다.</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="제목 또는 내담자 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem 0.6rem 2.5rem',
                                borderRadius: '12px',
                                border: '1.5px solid var(--border)',
                                fontSize: '0.85rem',
                                width: '220px',
                                background: 'white'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'completed')}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '12px',
                            border: '1.5px solid var(--border)',
                            fontSize: '0.85rem',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">전체 상태</option>
                        <option value="draft">작성 중</option>
                        <option value="completed">발행 완료</option>
                    </select>
                </div>
            </div>

            <div className="card glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {filteredList.length === 0 ? (
                    <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>문서가 없습니다.</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>검색 조건을 확인하거나 새로운 보고서를 작성해보세요.</p>
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {filteredList.map((report) => (
                            <li key={report.id}
                                onClick={() => onLoadReport(report)}
                                style={{
                                    padding: '1.5rem 2rem',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'var(--transition)'
                                }}
                                className="list-item-hover"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: report.mode === 'academic' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                                    }}>
                                        {report.mode === 'academic' ? '🎓' : '⚡️'}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                            {report.title || '제목 없는 보고서'}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: report.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                                color: report.status === 'completed' ? '#22c55e' : 'var(--text-muted)',
                                                fontWeight: 700
                                            }}>
                                                {report.status === 'completed' ? '발행완료' : '작성 중'}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {report.mode === 'academic' ? '표준형' : '핵심형'} • {new Date(report.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => onDeleteReport(e, report.id)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: '8px', color: '#ef4444', fontSize: '1rem'
                                    }}
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
