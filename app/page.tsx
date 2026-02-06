'use client';

import { useState, useEffect } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { initialReportData, ReportData, ReportEntry } from '../lib/types';
import { checkCompletion, generateReportHtml } from '../lib/reportBuilder';
import { getReports, saveReport, deleteReport } from '../lib/storage';
import { recordUsage } from '../lib/usage';
import Dashboard from '../components/Dashboard';
import ReportWizard from '../components/ReportWizard';
import TranscriptModal from '../components/TranscriptModal';
import SettingsModal from '../components/SettingsModal';
import '../components/Styles.css';

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [step, setStep] = useState(0); // 0 = Mode Selection
  const [data, setData] = useState<ReportData>(initialReportData);
  const [showReport, setShowReport] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'openai' | 'gemini'>('openai');
  const [reportList, setReportList] = useState<ReportEntry[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ data: string, mimeType: string } | null>(null);

  useEffect(() => {
    setReportList(getReports());
  }, []);

  const updateData = (key: keyof ReportData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = () => {
    const entry = saveReport(data, 'draft');
    setData(prev => ({ ...prev, id: entry.id }));
    setReportList(getReports());
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
    if (entry.status === 'completed') {
      setShowReport(true);
    } else {
      setShowReport(false);
      setStep(1);
    }
    setView('wizard');
  };

  const handleStartNew = () => {
    setData(initialReportData);
    setStep(0);
    setView('wizard');
    setShowReport(false);
    setShowTranscriptModal(false);
  };

  const handleStartWithTranscript = () => {
    setData(initialReportData);
    setStep(1);
    setView('wizard');
    setShowTranscriptModal(true);
  };

  const returnToDashboard = () => {
    if (confirm('작성 중인 내용은 저장되지 않았을 수 있습니다. 나가시겠습니까?')) {
      setView('dashboard');
      setShowReport(false);
      setReportList(getReports());
    }
  };

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하만 가능합니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const data = base64.split(',')[1];
      setUploadedFile({ data, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAI = async () => {
    await complete('', {
      body: { data, selectedModel }
    });
    saveReport(data, 'completed');
    setReportList(getReports());
  };

  const handleDownloadWord = () => {
    const reportHtml = generateReportHtml(data, completion);
    const documentTitle = `하나마인드케어_보고서_${data.clientName || '미지정'}`;

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${documentTitle}</title>
        <style>
          body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; }
          .report-container { width: 100%; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; text-align: center; }
          h2 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px; }
          .meta-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .highlight-section { background: #f1f5f9; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          td { border: 1px solid #ddd; padding: 8px; }
          .content-block { margin-top: 10px; }
          strong { color: #334155; }
        </style>
      </head>
      <body>
    `;
    const footer = "</body></html>";
    const source = header + reportHtml + footer;

    const blob = new Blob(['\ufeff', source], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAnalyzeTranscript = async () => {
    if (!transcriptText.trim() && !uploadedFile) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportMode: data.reportMode,
          sctData: data.sctData,
          mmpiData: data.mmpiData,
          transcript: transcriptText,
          fileData: uploadedFile?.data,
          mimeType: uploadedFile?.mimeType,
          selectedModel: selectedModel,
          counselingTheory: data.counselingTheory || 'none'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setData(prev => ({ ...prev, ...result }));
        if (result.usage) {
          recordUsage(result.usage.promptTokens, result.usage.completionTokens, selectedModel);
        }
        setShowTranscriptModal(false);
        setStep(1);
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

  if (view === 'dashboard') {
    return (
      <Dashboard
        reportList={reportList}
        onStartNew={handleStartNew}
        onStartWithTranscript={handleStartWithTranscript}
        onLoadReport={handleLoadReport}
        onDeleteReport={handleDelete}
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
      />
    );
  }

  if (showReport) {
    const reportHtml = generateReportHtml(data, completion);
    return (
      <main className="container">
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button className="btn btn-secondary" onClick={() => setShowReport(false)} style={{ marginRight: '10px' }}>수정하기</button>
            <button className="btn btn-secondary" onClick={() => { setShowReport(false); setView('dashboard'); }}>내 문서함으로 이동</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={handleDownloadWord}>Word 다운로드</button>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as 'openai' | 'gemini')}
              className="input"
              style={{ padding: '0.5rem', width: 'auto' }}
            >
              <option value="openai">ChatGPT (GPT-4o)</option>
              <option value="gemini">Google (Gemini)</option>
            </select>
            <button className="btn btn-primary" onClick={handleGenerateAI} disabled={isLoading}>
              {isLoading ? '생성 중...' : 'AI로 문장 다듬기'}
            </button>
          </div>
        </div>
        {isLoading && <p className="step-description">AI가 사례 개념화를 작성 중입니다...</p>}
        <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
      </main>
    );
  }

  return (
    <>
      <ReportWizard
        step={step}
        setStep={setStep}
        data={data}
        updateData={updateData}
        onReturnToDashboard={returnToDashboard}
        onSaveDraft={handleSaveDraft}
        onShowSettings={() => setShowSettingsModal(true)}
        onShowTranscriptModal={() => setShowTranscriptModal(true)}
        canProceed={checkCompletion(data, step)}
        onNext={() => setStep(s => s + 1)}
        onBack={() => setStep(s => s - 1)}
        onSubmit={() => setShowReport(true)}
      />
      {showTranscriptModal && (
        <TranscriptModal
          reportMode={data.reportMode}
          transcriptText={transcriptText}
          setTranscriptText={setTranscriptText}
          uploadedFile={uploadedFile}
          handleFileChange={handleFileChange}
          setUploadedFile={setUploadedFile}
          onAnalyze={handleAnalyzeTranscript}
          onClose={() => setShowTranscriptModal(false)}
          isAnalyzing={isAnalyzing}
          onUpdateReportMode={(mode) => updateData('reportMode', mode)}
          counselingTheory={data.counselingTheory || 'none'}
          onUpdateTheory={(theory) => updateData('counselingTheory', theory)}
        />
      )}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </>
  );
}
