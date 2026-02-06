import React from 'react';
import { ReportData } from '../../lib/types';
import '../Styles.css';

interface Props {
    data: ReportData;
    updateData: (key: keyof ReportData, value: string) => void;
}

export default function PsychTestInput({ data, updateData }: Props) {
    const [showSCT, setShowSCT] = React.useState(false);
    const [showMMPI, setShowMMPI] = React.useState(false);

    return (
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span> 심리검사 데이터 (선택 사항)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                심리검사 결과를 입력하면 AI가 사례 개념화에 이를 반영하여 더 전문적인 분석을 제공합니다.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setShowSCT(!showSCT)}
                    className={`btn ${showSCT ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px' }}
                >
                    {showSCT ? '✓ SCT 입력 중' : '+ 문장완성검사 (SCT)'}
                </button>
                <button
                    onClick={() => setShowMMPI(!showMMPI)}
                    className={`btn ${showMMPI ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px' }}
                >
                    {showMMPI ? '✓ MMPI-2 입력 중' : '+ MMPI-2 프로파일'}
                </button>
            </div>

            {showSCT && (
                <div className="input-group fade-in" style={{ marginBottom: '2rem' }}>
                    <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        문장완성검사 (SCT) 반응 데이터
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)' }}>전문 심리 분석용</span>
                    </label>
                    <textarea
                        className="textarea"
                        rows={8}
                        placeholder="내담자의 주요 반응들을 입력하세요. (예: 1. 나에게 이상한 일이 생기면... 당황스럽다 / 2. 내 생각에 여자란... 이해하기 힘들다)"
                        value={data.sctData}
                        onChange={(e) => updateData('sctData', e.target.value)}
                        style={{ minHeight: '200px', fontSize: '1rem' }}
                    />
                </div>
            )}

            {showMMPI && (
                <div className="input-group fade-in">
                    <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        MMPI-2 척도별 T-점수
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--secondary)' }}>임상 척도 중심</span>
                    </label>
                    <textarea
                        className="textarea"
                        rows={5}
                        placeholder="임상 척도 T-점수를 입력하세요. (예: L: 45, F: 62, K: 50, Hs: 70, D: 85, Hy: 65, Pd: 72, Mf: 50, Pa: 60, Pt: 78, Sc: 80, Ma: 55, Si: 68)"
                        value={data.mmpiData}
                        onChange={(e) => updateData('mmpiData', e.target.value)}
                        style={{ minHeight: '150px', fontSize: '1rem' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        * 타당도 척도(L, F, K)와 임상 척도(1-0) 점수를 입력하면 AI가 유형 분석을 수행합니다.
                    </p>
                </div>
            )}
        </div>
    );
}
