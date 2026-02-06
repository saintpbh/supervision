'use client';

import React from 'react';
import { ReportData, stepsList } from '../lib/types';
import Step1_Core from './StepWizard/Step1_Core';
import Step2_Facts from './StepWizard/Step2_Facts';
import Step3_Judgment from './StepWizard/Step3_Judgment';
import Step4_Review from './StepWizard/Step4_Review';

interface ReportWizardProps {
    step: number;
    setStep: (step: number) => void;
    data: ReportData;
    updateData: (key: keyof ReportData, value: string) => void;
    onReturnToDashboard: () => void;
    onSaveDraft: () => void;
    onShowSettings: () => void;
    onShowTranscriptModal: () => void;
    canProceed: boolean;
    onNext: () => void;
    onBack: () => void;
    onSubmit: () => void;
}

export default function ReportWizard({
    step,
    setStep,
    data,
    updateData,
    onReturnToDashboard,
    onSaveDraft,
    onShowSettings,
    onShowTranscriptModal,
    canProceed,
    onNext,
    onBack,
    onSubmit
}: ReportWizardProps) {

    if (step === 0) {
        return (
            <main className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ marginBottom: '2rem', paddingTop: '1rem' }}>
                    <button onClick={onReturnToDashboard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>&larr;</span> 내 문서함으로 돌아가기
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                        Step 0: Style Selection
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 900 }}>어떤 보고서를 작성할까요?</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>원하시는 보고서 유형을 선택하시면 최적화된 가이드를 제공합니다.</p>
                </div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                    <button
                        onClick={onShowSettings}
                        className="glass-panel"
                        style={{ border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        ⚙️
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                    <div
                        className="card glass-card hover-card"
                        onClick={() => { updateData('reportMode', 'efficiency'); setStep(1); }}
                        style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(236, 72, 153, 0.05)', borderRadius: '50%' }} />
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⚡️</div>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem', fontWeight: 800 }}>10분 완성 (핵심형)</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            바쁜 수련생과 전문가를 위한 고효율 모델.<br />
                            <strong>A4 1-2장 분량</strong>으로 핵심적인<br />
                            상담 역동과 개입 전략을 빠르게 도출합니다.
                        </p>
                        <div style={{ marginTop: '2rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>선택하기 &rarr;</div>
                    </div>
                    <div
                        className="card glass-card hover-card"
                        onClick={() => { updateData('reportMode', 'academic'); setStep(1); }}
                        style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '50%' }} />
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎓</div>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem', fontWeight: 800 }}>자격 심사 (표준형)</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            학회 수련 및 자격 심사용 정석 모델.<br />
                            <strong>A4 10장 이상</strong>의 상세한 배경 정보와<br />
                            전체 축어록을 포함하는 표준 양식입니다.
                        </p>
                        <div style={{ marginTop: '2rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>선택하기 &rarr;</div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="container" style={{ maxWidth: '1200px', padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <aside style={{ width: '280px', position: 'sticky', top: '2rem' }}>
                    <button onClick={onReturnToDashboard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                        <span>&larr;</span> 돌아가기
                    </button>

                    <div className="card glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.2rem' }}>{data.reportMode === 'academic' ? '🎓' : '⚡️'}</span>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Step-by-Step</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {data.reportMode === 'academic' ? '표준 수련 심사 양식' : '핵심 중심 요약 양식'}
                            </p>
                        </div>

                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {stepsList.map((s) => {
                                const isActive = s.id === step;
                                const isCompleted = s.id < step;
                                const isDisabled = s.id > step && !isCompleted;

                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => { if (!isDisabled) setStep(s.id); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '0.75rem 1rem', borderRadius: '12px',
                                            border: 'none', cursor: !isDisabled ? 'pointer' : 'default',
                                            background: isActive ? 'var(--primary)' : 'transparent',
                                            color: isActive ? 'white' : (isCompleted ? 'var(--text-primary)' : 'var(--text-muted)'),
                                            textAlign: 'left', transition: 'var(--transition)',
                                            opacity: isDisabled ? 0.5 : 1
                                        }}
                                    >
                                        <span style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: isActive ? 'rgba(255,255,255,0.2)' : (isCompleted ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0,0,0,0.05)'),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                                            color: isActive ? 'white' : (isCompleted ? 'var(--primary)' : 'var(--text-muted)')
                                        }}>
                                            {isCompleted ? '✓' : s.id}
                                        </span>
                                        <span style={{ fontWeight: isActive ? 700 : 500, fontSize: '0.85rem' }}>{s.title}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                            <button
                                onClick={onSaveDraft}
                                className="btn"
                                style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', borderRadius: '10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            >
                                💾 Draft Save
                            </button>
                        </div>
                    </div>
                </aside>

                <div style={{ flex: 1 }}>
                    <div className="card glass-card" style={{ padding: '3.5rem', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                            <div className="progress-bar" style={{ flex: 1, marginBottom: 0 }}>
                                {stepsList.map(s => (
                                    <div key={s.id} className={`progress-step ${s.id <= step ? 'active' : ''}`} />
                                ))}
                            </div>
                            {step === 1 && (
                                <button
                                    className="btn"
                                    style={{ marginLeft: '1.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', padding: '0.6rem 1.25rem', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                    onClick={onShowTranscriptModal}
                                >
                                    ✨ AI Auto-Fill
                                </button>
                            )}
                        </div>

                        <div style={{ flex: 1 }}>
                            {step === 1 && <Step1_Core data={data} updateData={updateData} />}
                            {step === 2 && <Step2_Facts data={data} updateData={updateData} />}
                            {step === 3 && <Step3_Judgment data={data} updateData={updateData} />}
                            {step === 4 && <Step4_Review data={data} updateData={updateData} onSubmit={onSubmit} />}
                        </div>

                        <div className="wizard-nav" style={{ marginTop: '4rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={onBack}
                                disabled={step === 1}
                                style={{ visibility: step === 1 ? 'hidden' : 'visible', borderRadius: '12px', padding: '0.75rem 2rem' }}
                            >
                                &larr; 이전 단계
                            </button>
                            {step < 4 ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={onNext}
                                    disabled={!canProceed}
                                    style={{ borderRadius: '12px', padding: '0.75rem 2.5rem' }}
                                >
                                    다음 단계 &rarr;
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={onSubmit}
                                    style={{ borderRadius: '12px', padding: '0.75rem 2.5rem', background: 'var(--secondary)' }}
                                >
                                    보고서 초안 생성 &rarr;
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
