import { ReportData } from '../../lib/types';

interface Props {
    data: ReportData;
    updateData: (key: keyof ReportData, value: string) => void;
    onSubmit: () => void;
}

export default function Step4_Review({ data, updateData, onSubmit }: Props) {
    return (
        <div className="wizard-step fade-in">
            <h2 className="step-title">4. 근거 및 검토 (Review)</h2>
            <p className="step-description">상담의 구체적인 증거와 수퍼비전 질문을 정리합니다.</p>

            <div className="form-group">
                <label className="label">해당 세션 요약 (Brief Summary)</label>
                <textarea
                    className="textarea"
                    rows={3}
                    value={data.sessionSummary}
                    onChange={e => updateData('sessionSummary', e.target.value)}
                    placeholder="오늘 세션에서 일어난 주요 사건 요약"
                    autoFocus
                />
            </div>

            <div className="form-group">
                <label className="label">
                    {data.reportMode === 'academic' ? '전체 축어록 (Full Transcript)' : '주요 대화 (Key Dialogue)'}
                </label>
                {data.reportMode === 'academic' ? (
                    <textarea
                        className="textarea"
                        rows={15}
                        value={data.fullTranscript || ''}
                        onChange={e => updateData('fullTranscript', e.target.value)}
                        placeholder="전체 녹취록을 여기에 붙여넣으세요..."
                        style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}
                    />
                ) : (
                    <textarea
                        className="textarea"
                        rows={6}
                        value={data.verbatim}
                        onChange={e => updateData('verbatim', e.target.value)}
                        placeholder="상담자: ... \n내담자: ..."
                    />
                )}
            </div>

            <div className="form-group">
                <label className="label">수퍼비전 질문 (Questions)</label>
                <textarea
                    className="textarea"
                    rows={4}
                    value={data.supervisionQuestions}
                    onChange={e => updateData('supervisionQuestions', e.target.value)}
                    placeholder="수퍼바이저에게 묻고 싶은 구체적인 질문 1~2가지"
                />
            </div>

            <button className="btn btn-primary" onClick={onSubmit} style={{ width: '100%', marginTop: '1rem' }}>
                최종 보고서 생성
            </button>
        </div>
    );
}
