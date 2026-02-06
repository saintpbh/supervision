import { ReportData } from './types';

export function checkCompletion(data: ReportData, step: number): boolean {
  if (step === 1) return !!data.coreQuestion;
  if (step === 2) return !!data.clientName && !!data.chiefComplaint;
  if (step === 3) return !!data.selectedIntervention && !!data.hesitationReason;
  return true;
}

const theoryLabels: Record<string, string> = {
  'psychoanalysis': '정신분석',
  'object-relations': '대상관계',
  'cbt': '인지행동(CBT)',
  'humanistic': '인간중심',
  'gestalt': '게슈탈트',
  'none': '일반 분석'
};

export function generateReportHtml(data: ReportData, aiContent?: string): string {
  // If Academic Mode, use the extensive template
  if (data.reportMode === 'academic') {
    return generateAcademicReportHtml(data, aiContent);
  }

  const theoryName = theoryLabels[data.counselingTheory || 'none'] || '일반 분석';

  // --- Efficiency Mode (Existing) ---
  const conceptualizationSection = aiContent ?
    `<!-- AI Generated Content -->
     <div style="background: rgba(99, 102, 241, 0.03); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--primary);">
       <p style="margin-top: 0; font-weight: 800; color: var(--primary);">🧠 AI 사례 개념화 (${theoryName} 기반)</p>
       <p style="white-space: pre-wrap; color: #333; line-height: 1.8; margin-bottom: 0;">${aiContent}</p>
     </div>` :
    `<!-- Template Content -->
     <p><strong>1. 수퍼비전 요청 사유 (The Anchor)</strong><br>
     ${data.coreQuestion}</p>

     <p><strong>2. 역동적 이해 (${theoryName})</strong><br>
     내담자에게서 ${data.patternObservation || '반복적인 패턴'}이 관찰된다. 
     이 사례는 ${data.synthesis || '내담자의 기질과 환경적 압박의 상호작용'}으로 이해된다.</p>

     <p><strong>3. 주요 개입 및 망설임 (B-3)</strong><br>
     이 과정에서 비록 ${data.consideredIntervention || '직접적인 개입'}을 고려하였으나, 
     <strong>${data.selectedIntervention}</strong>을 우선적으로 선택하였다. 
     상담자가 이 과정에서 경험한 망설임은 ${data.hesitationReason} 때문이며, 
     이는 내담자의 양가감정에 대한 역전이 반응으로 이해된다.</p>

     <p><strong>4. 상담 목표</strong><br>
     따라서 현재 상담의 초점은 ${data.counselingGoal || '정서적 안정감을 확보하는 것'}에 두고 있다.</p>`;

  return `
    <style>
      @media print {
        body { background: white !important; }
        .report-container { 
            box-shadow: none !important; 
            margin: 0 !important; 
            padding: 2cm !important; 
            width: 100% !important;
            max-width: none !important;
        }
        .gradient-text { -webkit-background-clip: unset !important; -webkit-text-fill-color: black !important; color: black !important; }
        .highlight-section { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
        button, aside, nav, .wizard-nav { display: none !important; }
      }
    </style>
    <div class="report-container">
      <h1 class="report-title">상담 수퍼비전 보고서 (Efficiency)</h1>
      <div class="meta-info">
        <p><strong>상담자:</strong> ${data.counselorName} | <strong>내담자:</strong> ${data.clientName} (${data.clientAgeGender}) | <strong>회기:</strong> ${data.counselingCount}</p>
        <p style="margin-top: 5px; font-size: 0.9rem; color: var(--text-muted);"><strong>적용 이론:</strong> ${theoryName}</p>
      </div>

      <div class="section">
        <h2>A. 내담자 개요 (Facts)</h2>
        <div class="content-block">
            <p><strong>1. 기본 정보 및 맥락</strong><br>
            내담자는 ${data.clientAgeGender}으로 현재 ${data.socialContext}에 있으며, ${data.triggerEvent || '최근의 스트레스 요인'}으로 인해 상담을 신청하였다. 
            주 호소문제로는 "${data.chiefComplaint}"를 보고하고 있다.</p>
            
            <p><strong>2. 가족 및 대인관계</strong><br>
            ${data.familyRelations || '가족 관계에 대한 특이 보고사항 없음.'}</p>
        </div>
      </div>

      <div class="section highlight-section">
        <h2>B. 사례 개념화 및 상담자 판단 (Core)</h2>
        <div class="content-block">
            ${data.sctInterpretation || data.mmpiAnalysis ? `
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(99, 102, 241, 0.05); border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.1);">
                <h3 style="margin-top: 0; color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.3rem;">📊</span> 심리검사 기반 임상적 소견
                </h3>
                <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
                    ${data.mmpiAnalysis ? `
                    <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <p style="margin-top: 0; font-weight: 700; color: #444; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 8px;">MMPI-2 분석</p>
                        <p style="margin-bottom: 0; font-size: 0.95rem; line-height: 1.6;">${data.mmpiAnalysis}</p>
                    </div>` : ''}
                    ${data.sctInterpretation ? `
                    <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <p style="margin-top: 0; font-weight: 700; color: #444; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 8px;">SCT 해석</p>
                        <p style="margin-bottom: 0; font-size: 0.95rem; line-height: 1.6;">${data.sctInterpretation}</p>
                    </div>` : ''}
                </div>
            </div>
            ` : ''}
            ${conceptualizationSection}
        </div>
      </div>

      <div class="section">
        <h2>C. 상담 과정 (Evidence)</h2>
        <div class="content-block">
            <p><strong>세션 요약:</strong> ${data.sessionSummary}</p>
            <p><strong>주요 대화 (축어록):</strong><br>
            <em style="white-space: pre-wrap;">${data.verbatim}</em></p>
        </div>
      </div>

       <div class="section">
        <h2>D. 수퍼비전 질문</h2>
        <div class="content-block">
            <p style="white-space: pre-wrap;">${data.supervisionQuestions}</p>
        </div>
      </div>
    </div>
  `;
}

// --- Academic Mode (Extensive) ---
function generateAcademicReportHtml(data: ReportData, aiContent?: string): string {
  const conceptualization = aiContent || data.synthesis;

  return `
      <div class="report-container academic-mode">
        <h1 class="report-title" style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px;">
            상담 사례 연구 보고서
            <span style="display:block; font-size: 1rem; font-weight: normal; margin-top: 10px;">(한국상담심리학회 자격심사 표준 양식 준용)</span>
        </h1>
  
        <div class="meta-table" style="border: 1px solid #000; padding: 20px; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
             <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>상 담 자:</strong> ${data.counselorName}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>수퍼바이저:</strong> (공란)</td>
             </tr>
             <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>내 담 자:</strong> ${data.clientName} (${data.clientAgeGender})</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>상담 회기:</strong> ${data.counselingCount}</td>
             </tr>
             <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>적용 이론:</strong> ${theoryLabels[data.counselingTheory || 'none']}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>상담 일시:</strong> 202X년 X월 X일</td>
             </tr>
          </table>
        </div>
  
        <div class="section">
          <h2>I. 내담자 신상 정보 및 상담 신청 경위</h2>
          <div class="content-block">
              <h3>1. 내담자 정보</h3>
              <p>성명: ${data.clientName} (가명)<br>
              나이/성별: ${data.clientAgeGender}<br>
              직업/사회적 배경: ${data.socialContext}</p>
  
              <h3>2. 상담 신청 경위 (Trigger Event)</h3>
              <p>${data.triggerEvent}</p>
              <p>내담자는 최근 상기 사건을 계기로 심리적 고통을 호소하며 자발적으로(또는 권유로) 본 상담센터를 방문하였다.</p>
  
              <h3>3. 주 호소 문제 (Chief Complaint)</h3>
              <p>"${data.chiefComplaint}"</p>
              <p>내담자가 호소하는 주된 어려움은 위와 같으며, 이는 일상생활의 기능 저하와 정서적 불안정을 초래하고 있다.</p>
          </div>
        </div>
  
        <div class="section">
          <h2>II. 내담자 배경 정보 및 발달사</h2>
          <div class="content-block">
              <h3>1. 가족 관계 및 가계도</h3>
              <p>${data.familyRelations}</p>
              <div style="width: 100%; height: 200px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; background: #f9f9f9; margin: 10px 0;">
                  (여기에 가계도 Genogram 이미지를 첨부하십시오)
              </div>
  
              <h3>2. 개인 발달사 및 병력</h3>
              <p>내담자의 초기 발달 과정 및 주요 생애 사건에 대한 상세 기술. (상담 중 수집된 정보를 바탕으로 보충 필요)</p>
          </div>
        </div>
  
        <div class="section">
          <h2>III. 심리 검사 결과 및 해석</h2>
          <div class="content-block">
              ${data.mmpiAnalysis || data.sctInterpretation ? `
                <div class="test-results">
                    ${data.mmpiData ? `
                    <div style="margin-bottom: 30px; border-left: 3px solid #333; padding-left: 15px;">
                        <h3 style="font-size: 1.1rem; color: #000; margin-bottom: 10px;">1. MMPI-2 다면적 인성검사</h3>
                        <div style="background: #f8f8f8; padding: 12px; border: 1px solid #eee; font-family: 'Courier New', monospace; margin-bottom: 10px; font-size: 0.9rem;">
                            <strong>[Raw Data]:</strong> ${data.mmpiData}
                        </div>
                        <p style="line-height: 1.8; text-align: justify; margin-top: 10px;"><strong>[임상 소견]:</strong> ${data.mmpiAnalysis}</p>
                    </div>
                    ` : ''}
                    
                    ${data.sctData ? `
                    <div style="margin-bottom: 30px; border-left: 3px solid #333; padding-left: 15px;">
                        <h3 style="font-size: 1.1rem; color: #000; margin-bottom: 10px;">2. SCT 문장완성검사</h3>
                        <div style="background: #f8f8f8; padding: 12px; border: 1px solid #eee; font-style: italic; margin-bottom: 10px; font-size: 0.9rem;">
                            <strong>[핵심 반응]:</strong> ${data.sctData}
                        </div>
                        <p style="line-height: 1.8; text-align: justify; margin-top: 10px;"><strong>[역동 해석]:</strong> ${data.sctInterpretation}</p>
                    </div>
                    ` : ''}
                </div>
              ` : `
                <p><em>(실시된 심리검사가 있다면 상세 내용을 기술하십시오. 예: MMPI-2, TCI, SCT 등)</em></p>
                <ul>
                    <li>BDI-II: 점수 (해석)</li>
                    <li>BAI: 점수 (해석)</li>
                </ul>
              `}
          </div>
        </div>
  
        <div class="section highlight-section">
          <h2>IV. 사례 개념화 (Case Conceptualization)</h2>
          <div class="content-block">
              <h3>1. 내담자의 성격 역동 및 핵심 문제</h3>
              <p>${conceptualization}</p>

              <h3>2. 상담자의 심리적 반응 (역전이)</h3>
              <p>상담자는 본 사례에서 다음과 같은 망설임 혹은 감정을 경험하였다: ${data.hesitationReason}.</p>
          </div>
        </div>
  
        <div class="section">
          <h2>V. 상담 목표 및 전략</h2>
          <div class="content-block">
              <h3>1. 상담 목표</h3>
              <p>${data.counselingGoal}</p>
  
              <h3>2. 상담 과정 및 전략</h3>
              <p>현재 상담은 초기/중기/종결 단계 중 X단계에 해당하며, 주된 개입 전략은 <strong>${data.selectedIntervention}</strong>이다.</p>
          </div>
        </div>
  
        <div class="section">
          <h2>VI. 수퍼비전 질의 사항</h2>
          <div class="content-block">
              <p>${data.coreQuestion}</p>
              <div style="background: #eee; padding: 15px; border-left: 4px solid #555;">
                  <strong>상담자의 구체적 질문:</strong><br>
                  ${data.supervisionQuestions}
              </div>
          </div>
        </div>
  
        <div class="section">
          <h2>VII. 축어록 (Verbatim Transcript)</h2>
          <div class="content-block">
              <h3>1. 주요 세션 요약</h3>
              <p>${data.sessionSummary}</p>
  
              <h3>2. 전체 녹취록</h3>
              <div style="font-family: 'Courier New', monospace; font-size: 0.9rem; background: #fff; border: 1px solid #ddd; padding: 15px;">
                  ${data.fullTranscript ? data.fullTranscript.split('\n').map(line => `<p style="margin: 0; padding: 2px 0;">${line}</p>`).join('') : '<p>(전체 축어록이 입력되지 않았습니다)</p>'}
              </div>
          </div>
        </div>
      </div>
    `;
}
