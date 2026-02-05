'use client';

import { useState, useEffect } from 'react';
import { useCompletion } from '@ai-sdk/react';
import Step1_Core from '../components/StepWizard/Step1_Core';
import Step2_Facts from '../components/StepWizard/Step2_Facts';
import Step3_Judgment from '../components/StepWizard/Step3_Judgment';
import Step4_Review from '../components/StepWizard/Step4_Review';
import SettingsModal from '../components/SettingsModal';
import { initialReportData, ReportData, ReportEntry } from '../lib/types';
import { checkCompletion, generateReportHtml } from '../lib/reportBuilder';
import { getReports, saveReport, deleteReport } from '../lib/storage';
import { getDirectoryHandle } from '../lib/idb';
import { recordUsage } from '../lib/usage';
import '../components/Styles.css';

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [step, setStep] = useState(0); // 0 = Mode Selection
  const [data, setData] = useState<ReportData>(initialReportData);
  const [showReport, setShowReport] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'openai' | 'gemini'>('openai');
  const totalSteps = 4;

  const [reportList, setReportList] = useState<ReportEntry[]>([]);

  // Settings Management
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Load reports on mount & Auto-Backup Loop
  useEffect(() => {
    setReportList(getReports());

    // Auto Backup Setup
    const performAutoBackup = async () => {
      const isEnabled = localStorage.getItem('auto_backup_enabled') === 'true';
      if (!isEnabled) return;

      try {
        const dirHandle = await getDirectoryHandle();
        if (!dirHandle) return; // No handle saved

        // Re-verify permission if needed (though usually persisted for session or site?)
        // Note: If permission is lost, it might fail silent or throw. 
        // In modern Chrome, if handle is stored in IDB, permission persists until revoked or site data cleared? 
        // Actually, permission IS revocable. We might need verifyPermission logic but let's try simple write first.

        const reports = getReports();
        if (reports.length === 0) return;

        const fileHandle = await dirHandle.getFileHandle('hanamindcare_auto_backup.json', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(reports, null, 2));
        await writable.close();
        console.log("Auto-backup success: " + new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Auto-backup failed:", err);
        // Optionally disable if permission error?
      }
    };

    // Run once on load if enabled (optional) or just start interval
    // performAutoBackup();

    const intervalId = setInterval(performAutoBackup, 60 * 1000); // 1 minute

    return () => clearInterval(intervalId);
  }, []);

  const updateData = (key: keyof ReportData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = () => {
    const entry = saveReport(data, 'draft');
    setData(prev => ({ ...prev, id: entry.id })); // Ensure ID is set
    setReportList(getReports()); // Update list
    alert('임시 저장되었습니다.');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteReport(id);
      setReportList(getReports());
    }
  };

  const handleLoadReport = (entry: ReportEntry) => {
    setData(entry.data);
    // Determine step based on status or data??
    // For now, let's go to step 1 if draft, or show report if completed?
    // Actually, user wants to "continue writing".
    // Let's go to step 1.
    setStep(1);
    setView('wizard');
    // If it has a mode, set it (it should be in data)
  };

  const handleStartNew = () => {
    setData(initialReportData);
    setStep(0);
    setView('wizard');
  };

  const returnToDashboard = () => {
    if (confirm('작성 중인 내용은 저장되지 않았을 수 있습니다. 나가시겠습니까?')) {
      setView('dashboard');
      setReportList(getReports());
    }
  };


  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Save as completed? Or just show report?
    // User flow: Review -> Generate -> Show Report (Preview)
    // We can save implicitly when generating report
    setShowReport(true);
  };

  const handleGenerateAI = async () => {
    const apiKey = localStorage.getItem('google_api_key');
    if (selectedModel === 'gemini' && !apiKey) {
      alert("Google API Key가 설정되지 않았습니다. 설정 메뉴에서 키를 입력해주세요.");
      setShowSettingsModal(true);
      return;
    }

    await complete('', {
      body: {
        data,
        selectedModel,
        apiKey: apiKey
      }
    });
    // Mark as completed after generation starts? 
    saveReport(data, 'completed');
    setReportList(getReports());
  };

  const handleAnalyzeTranscript = async () => {
    const apiKey = localStorage.getItem('google_api_key');
    if (!transcriptText.trim()) return;

    if (selectedModel === 'gemini' && !apiKey) {
      alert("Google API Key가 설정되지 않았습니다. 설정 메뉴에서 키를 입력해주세요.");
      setShowSettingsModal(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          selectedModel,
          apiKey: apiKey,
          reportMode: data.reportMode
        })
      });

      if (response.ok) {
        const result = await response.json();
        setData(prev => ({
          ...prev,
          ...result,
          clientName: result.clientName || prev.clientName,
          clientAgeGender: result.clientAgeGender || prev.clientAgeGender,
          triggerEvent: result.triggerEvent || prev.triggerEvent,
          chiefComplaint: result.chiefComplaint || prev.chiefComplaint,
          coreQuestion: result.coreQuestion || prev.coreQuestion,
          sessionSummary: result.sessionSummary || prev.sessionSummary,
          patternObservation: result.patternObservation || prev.patternObservation,
          synthesis: result.synthesis || prev.synthesis,
          verbatim: result.verbatim || prev.verbatim
        }));
        if (result.usage) {
          recordUsage(result.usage.promptTokens, result.usage.completionTokens, selectedModel);
        }
        setShowTranscriptModal(false);
        alert("축어록 분석이 완료되었습니다.");
      } else {
        const err = await response.text();
        alert("분석에 실패했습니다: " + err);
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // DASHBOARD VIEW
  if (view === 'dashboard') {
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
            <button className="btn btn-primary" onClick={handleStartNew} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
              + 새 보고서 작성하기
            </button>
            <button className="btn btn-secondary" onClick={() => setShowTranscriptModal(true)} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
              ✨ 축어록에서 추출하기
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettingsModal && (
          <SettingsModal onClose={() => setShowSettingsModal(false)} />
        )}

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>내 문서함</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>총 {reportList.length}개의 문서가 보관되어 있습니다.</p>
          </div>
        </div>

        <div className="card glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          {reportList.length === 0 ? (
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>공란으로 비어 있습니다.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>새로운 보고서 작성을 시작하여 상담 기록을 남겨보세요.</p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {reportList.map((report) => (
                <li key={report.id}
                  onClick={() => handleLoadReport(report)}
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
                    onClick={(e) => handleDelete(e, report.id)}
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

  // WIZARD VIEW / REPORT VIEW
  if (showReport) {
    const reportHtml = generateReportHtml(data, completion);
    return (
      <main className="container">
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button className="btn btn-secondary" onClick={() => setShowReport(false)} style={{ marginRight: '10px' }}>수정하기</button>
            <button className="btn btn-secondary" onClick={() => setView('dashboard')}>내 문서함으로 이동</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as 'openai' | 'gemini')}
              className="input"
              style={{ padding: '0.5rem', width: 'auto' }}
            >
              <option value="openai">ChatGPT (GPT-4o)</option>
              <option value="gemini">Google (Gemini)</option>
            </select>
            <button
              className="btn btn-primary"
              onClick={handleGenerateAI}
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : 'AI로 문장 다듬기'}
            </button>
          </div>
        </div>
        {isLoading && <p className="step-description">AI가 사례 개념화를 작성 중입니다...</p>}
        <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
      </main>
    );
  }

  // WIZARD STEP VIEW
  const canProceed = checkCompletion(data, step);

  if (step === 0) {
    // Mode Selection Screen (In Wizard)
    return (
      <main className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ marginBottom: '2rem', paddingTop: '1rem' }}>
          <button onClick={returnToDashboard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

        {/* Settings Modal Toggle (Top Right) */}
        <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="glass-panel"
            style={{ border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ⚙️
          </button>
        </div>

        {showSettingsModal && (
          <SettingsModal onClose={() => setShowSettingsModal(false)} />
        )}


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

  // Active Wizard Step (1-4)
  const stepsList = [
    { id: 1, title: '핵심 요구', icon: '❓' },
    { id: 2, title: '내담자 정보', icon: '📄' },
    { id: 3, title: '사례 개념화', icon: '🧠' },
    { id: 4, title: '최종 검토', icon: '✅' }
  ];

  return (
    <main className="container" style={{ maxWidth: '1200px', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Sidebar Navigation */}
        <aside style={{ width: '280px', position: 'sticky', top: '2rem' }}>
          <button onClick={returnToDashboard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
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
                onClick={handleSaveDraft}
                className="btn"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', borderRadius: '10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                💾 Draft Save
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div style={{ flex: 1 }}>
          {showSettingsModal && (
            <SettingsModal onClose={() => setShowSettingsModal(false)} />
          )}

          {showTranscriptModal && (
            <div className="modal-overlay" style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
              <div className="card glass-card" style={{ width: '90%', maxWidth: '750px', maxHeight: '90vh', overflow: 'hidden', padding: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="gradient-text" style={{ fontSize: '2.25rem', fontWeight: 900 }}>축어록 자동 분석</h2>
                    <button onClick={() => setShowTranscriptModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                      className="glass-panel"
                      onClick={() => updateData('reportMode', 'efficiency')}
                      style={{
                        flex: 1, padding: '1rem', border: data.reportMode === 'efficiency' ? '2px solid var(--secondary)' : '1px solid var(--border)',
                        background: data.reportMode === 'efficiency' ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                        textAlign: 'center', cursor: 'pointer', borderRadius: '12px', transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>⚡️</div>
                      <div style={{ fontWeight: 700, color: data.reportMode === 'efficiency' ? 'var(--secondary)' : 'var(--text-primary)' }}>핵심형</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10분 완성 요약</div>
                    </button>
                    <button
                      className="glass-panel"
                      onClick={() => updateData('reportMode', 'academic')}
                      style={{
                        flex: 1, padding: '1rem', border: data.reportMode === 'academic' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: data.reportMode === 'academic' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        textAlign: 'center', cursor: 'pointer', borderRadius: '12px', transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🎓</div>
                      <div style={{ fontWeight: 700, color: data.reportMode === 'academic' ? 'var(--primary)' : 'var(--text-primary)' }}>표준형</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>심사용 정석</div>
                    </button>
                  </div>

                  <p className="step-description">분석할 축어록 전체를 붙여넣으세요. AI가 상담 맥락을 분석하여 보고서 항목을 채워줍니다.</p>
                  <textarea
                    className="textarea"
                    style={{ minHeight: '350px', fontSize: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    value={transcriptText}
                    onChange={e => setTranscriptText(e.target.value)}
                    placeholder="(상담자): 안녕하세요.&#10;(내담자): 네, 안녕하세요..."
                  />
                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn btn-secondary" style={{ borderRadius: '12px', padding: '0.75rem 2rem' }} onClick={() => setShowTranscriptModal(false)}>취소</button>
                    <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '0.75rem 2.5rem' }} onClick={handleAnalyzeTranscript} disabled={isAnalyzing}>
                      {isAnalyzing ? '데이터 분석 중...' : '분석 및 자동 완성'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  onClick={() => setShowTranscriptModal(true)}
                >
                  ✨ AI Auto-Fill
                </button>
              )}
            </div>

            <div style={{ flex: 1 }}>
              {step === 1 && <Step1_Core data={data} updateData={updateData} />}
              {step === 2 && <Step2_Facts data={data} updateData={updateData} />}
              {step === 3 && <Step3_Judgment data={data} updateData={updateData} />}
              {step === 4 && <Step4_Review data={data} updateData={updateData} onSubmit={handleSubmit} />}
            </div>

            <div className="wizard-nav" style={{ marginTop: '4rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={handleBack}
                disabled={step === 1}
                style={{ visibility: step === 1 ? 'hidden' : 'visible', borderRadius: '12px', padding: '0.75rem 2rem' }}
              >
                &larr; 이전 단계
              </button>
              {step < 4 ? (
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!canProceed}
                  style={{ borderRadius: '12px', padding: '0.75rem 2.5rem' }}
                >
                  다음 단계 &rarr;
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
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
