'use client';

import { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import Step1_Core from '../components/StepWizard/Step1_Core';
import Step2_Facts from '../components/StepWizard/Step2_Facts';
import Step3_Judgment from '../components/StepWizard/Step3_Judgment';
import Step4_Review from '../components/StepWizard/Step4_Review';
import { initialReportData, ReportData } from '../lib/types';
import { checkCompletion, generateReportHtml } from '../lib/reportBuilder';
import '../components/Styles.css';

export default function Home() {
  const [step, setStep] = useState(0); // Start at 0 for Mode Selection
  const [data, setData] = useState<ReportData>(initialReportData);
  const [showReport, setShowReport] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'openai' | 'gemini'>('openai');
  const totalSteps = 4;

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');

  const updateData = (key: keyof ReportData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    setShowReport(true);
  };

  const handleReset = () => {
    setStep(1);
    setShowReport(false);
    setData(initialReportData);
  };

  const handleGenerateAI = async () => {
    // Send the current data to the AI endpoint
    await complete('', {
      body: {
        data,
        selectedModel
      }
    });
  };

  const handleAnalyzeTranscript = async () => {
    if (!transcriptText.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText, selectedModel })
      });

      if (response.ok) {
        const result = await response.json();
        // Merge analyzed data into current data
        // We consciously map the result fields to our data structure
        setData(prev => ({
          ...prev,
          ...result,
          // Ensure specifically these are merged if present
          clientName: result.clientName || prev.clientName,
          clientAgeGender: result.clientAgeGender || prev.clientAgeGender,
          triggerEvent: result.triggerEvent || prev.triggerEvent,
          chiefComplaint: result.chiefComplaint || prev.chiefComplaint,
          coreQuestion: result.coreQuestion || prev.coreQuestion,
          sessionSummary: result.sessionSummary || prev.sessionSummary,
          verbatim: result.verbatim || prev.verbatim
        }));
        setShowTranscriptModal(false);
        alert("축어록 분석이 완료되었습니다. 내용이 자동으로 채워졌습니다.");
      } else {
        alert("분석에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (showReport) {
    // If AI generation happened, use 'completion' as the AI content.
    const reportHtml = generateReportHtml(data, completion);

    return (
      <main className="container">
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button className="btn btn-secondary" onClick={() => setShowReport(false)} style={{ marginRight: '10px' }}>수정하기</button>
            <button className="btn btn-secondary" onClick={handleReset}>새 보고서 작성</button>
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

  // Calculate Progress
  const canProceed = checkCompletion(data, step);

  // START SCREEN (Mode Selection)
  if (step === 0) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '3rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>하나마인드케어 수퍼비전</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>원하시는 보고서 유형을 선택해주세요.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          {/* Mode 1: Efficiency */}
          <div
            className="card glass-card hover-card"
            onClick={() => {
              updateData('reportMode', 'efficiency');
              setStep(1);
            }}
            style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s', padding: '2rem' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡️</div>
            <h2 style={{ marginBottom: '1rem' }}>10분 완성 (핵심형)</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              바쁜 전문가를 위한 고효율 모델.<br />
              A4 1-2장 분량.<br />
              핵심 역동과 개입 전략 위주.
            </p>
          </div>

          {/* Mode 2: Academic */}
          <div
            className="card glass-card hover-card"
            onClick={() => {
              updateData('reportMode', 'academic');
              setStep(1);
            }}
            style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s', padding: '2rem' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
            <h2 style={{ marginBottom: '1rem' }}>자격 심사 (표준형)</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              학회 수련 및 자격 심사용.<br />
              A4 10장 이상 (전체 축어록 포함).<br />
              상세한 내담자 배경 및 가계도 포함.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem' }}>
          {data.reportMode === 'academic' ? '자격 심사 표준 보고서' : '10분 완성 수퍼비전'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>10분 완성 수퍼비전 보고서 마법사</p>
      </div>

      {/* Transcript Modal */}
      {showTranscriptModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card glass-card" style={{ width: '80%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 className="gradient-text">축어록 자동 분석</h3>
            <p className="step-description">축어록 전체를 붙여넣으세요. AI가 내용을 분류해줍니다.</p>
            <textarea
              className="textarea"
              rows={10}
              value={transcriptText}
              onChange={e => setTranscriptText(e.target.value)}
              placeholder="(상담자): 안녕하세요...\n(내담자): 요즘 너무 힘들어요..."
            />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowTranscriptModal(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleAnalyzeTranscript} disabled={isAnalyzing}>
                {isAnalyzing ? '분석 중...' : '자동 분류 시작'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card glass-card">
        {/* Progress Bar & Magic Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="progress-bar" style={{ flex: 1, marginBottom: 0 }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`progress-step ${s <= step ? 'active' : ''}`} />
            ))}
          </div>
          {step === 1 && (
            <button
              className="btn"
              style={{ marginLeft: '1rem', backgroundColor: '#e0e7ff', color: '#4f46e5', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              onClick={() => setShowTranscriptModal(true)}
            >
              ✨ 축어록 넣기
            </button>
          )}
        </div>

        {/* Steps */}
        {step === 1 && <Step1_Core data={data} updateData={updateData} />}
        {step === 2 && <Step2_Facts data={data} updateData={updateData} />}
        {step === 3 && <Step3_Judgment data={data} updateData={updateData} />}
        {step === 4 && <Step4_Review data={data} updateData={updateData} onSubmit={handleSubmit} />}

        {/* Navigation */}
        <div className="wizard-nav">
          <button
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={step === 1}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            이전 단계
          </button>

          {step < 4 && (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!canProceed}
            >
              다음 단계
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
