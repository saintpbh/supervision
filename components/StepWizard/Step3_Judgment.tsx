import { ReportData } from '../../lib/types';

interface Props {
    data: ReportData;
    updateData: (key: keyof ReportData, value: string) => void;
}

export default function Step3_Judgment({ data, updateData }: Props) {
    return (
        <div className="step-container fade-in">
            <h2 className="step-title">3단계: 전문적 판단 (5분)</h2>
            <p className="step-description">
                당신의 통과/실패가 결정되는 곳입니다. 솔직한 망설임을 적으세요.
            </p>

            <div className="input-group">
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    1. 관찰된 반복 패턴
                    {data.patternObservation && <span className="ai-hint">✨ AI 통찰</span>}
                </label>
                <textarea
                    className="textarea"
                    rows={4}
                    value={data.patternObservation}
                    onChange={(e) => updateData('patternObservation', e.target.value)}
                    placeholder="예: 끊임없이 조언을 구하지만, 정작 조언을 해주면 거부하는 패턴."
                    autoFocus
                />
            </div>

            <div className="input-group">
                <label className="label">2. 사례 개념화 (종합적 이해)</label>
                <textarea
                    className="textarea"
                    rows={8}
                    value={data.synthesis}
                    onChange={(e) => updateData('synthesis', e.target.value)}
                    placeholder="예: 내담자의 완벽주의적 기질과 최근의 성과 압박이 상호작용한 결과로 이해됨."
                />
            </div>

            <div className="card glass-card inner-card">
                <h3>선택의 순간 (핵심 포인트)</h3>

                <div className="input-group">
                    <label className="label">고려했으나 하지 않은 개입</label>
                    <input
                        className="input"
                        value={data.consideredIntervention}
                        onChange={(e) => updateData('consideredIntervention', e.target.value)}
                        placeholder="예: 지각에 대해 직접적으로 직면하기"
                    />
                </div>

                <div className="input-group">
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        실제로 선택한 개입
                        {data.selectedIntervention && <span className="ai-hint">✨ 추천됨</span>}
                    </label>
                    <input
                        className="input"
                        value={data.selectedIntervention}
                        onChange={(e) => updateData('selectedIntervention', e.target.value)}
                        placeholder="예: 두려움에 공감하며 기다려주기"
                    />
                </div>

                <div className="input-group">
                    <label className="label">그 이유는? (임상적/감정적 이유)</label>
                    <textarea
                        className="textarea"
                        rows={4}
                        value={data.hesitationReason}
                        onChange={(e) => updateData('hesitationReason', e.target.value)}
                        placeholder="예: 지금 직면하면 형성된 라포가 깨질 것 같다는 역전이적 두려움을 느꼈음."
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    상담 목표 (이 선택에 기반한)
                    {data.counselingGoal && <span className="ai-hint">✨ AI 추천</span>}
                </label>
                <input
                    className="input"
                    value={data.counselingGoal}
                    onChange={(e) => updateData('counselingGoal', e.target.value)}
                    placeholder="예: 도전을 하기 전에 안전기지를 먼저 확보하는 것."
                />
            </div>

        </div>
    );
}
