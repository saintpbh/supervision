import { ReportData } from '../../lib/types';
import PsychTestInput from './PsychTestInput';

interface Props {
    data: ReportData;
    updateData: (key: keyof ReportData, value: string) => void;
}

export default function Step2_Facts({ data, updateData }: Props) {
    return (
        <div className="step-container fade-in">
            <h2 className="step-title">2단계: 기본 정보 입력 (2분)</h2>
            <p className="step-description">
                고민하지 마세요. 빈칸을 채우기만 하세요. (자동 생성의 재료가 됩니다)
            </p>

            <div className="grid-2">
                <div className="input-group">
                    <label className="label">상담자 이름</label>
                    <input
                        className="input"
                        value={data.counselorName}
                        onChange={(e) => updateData('counselorName', e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="input-group">
                    <label className="label">회기 수 / 날짜</label>
                    <input
                        className="input"
                        value={data.counselingCount}
                        onChange={(e) => updateData('counselingCount', e.target.value)}
                        placeholder="#3 / 2023.11.05"
                    />
                </div>
            </div>

            <div className="grid-2">
                <div className="input-group">
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        내담자 이니셜
                        {data.clientName && <span className="ai-hint">✨</span>}
                    </label>
                    <input
                        className="input"
                        value={data.clientName}
                        onChange={(e) => updateData('clientName', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        나이 / 성별
                        {data.clientAgeGender && <span className="ai-hint">✨</span>}
                    </label>
                    <input
                        className="input"
                        value={data.clientAgeGender}
                        onChange={(e) => updateData('clientAgeGender', e.target.value)}
                        placeholder="25 / 여"
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    촉발 사건 (Trigger)
                    {data.triggerEvent && <span className="ai-hint">✨ 분석됨</span>}
                </label>
                <input
                    className="input"
                    value={data.triggerEvent}
                    onChange={(e) => updateData('triggerEvent', e.target.value)}
                    placeholder="예: 연인과의 이별, 실직, 부모와의 다툼"
                />
            </div>

            <div className="input-group">
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    주 호소문제 (내담자의 언어)
                    {data.chiefComplaint && <span className="ai-hint">✨ 분석됨</span>}
                </label>
                <input
                    className="input"
                    value={data.chiefComplaint}
                    onChange={(e) => updateData('chiefComplaint', e.target.value)}
                    placeholder="예: '화를 조절할 수가 없어요.'"
                />
            </div>

            <div className="input-group">
                <label className="label">가족 관계 (간략히)</label>
                <textarea
                    className="textarea"
                    rows={2}
                    value={data.familyRelations}
                    onChange={(e) => updateData('familyRelations', e.target.value)}
                    placeholder="예: 소원한 아버지, 지지적인 어머니."
                />
            </div>

            <div className="input-group">
                <label className="label">현재 상황 (직업/학교)</label>
                <textarea
                    className="textarea"
                    rows={2}
                    value={data.socialContext}
                    onChange={(e) => updateData('socialContext', e.target.value)}
                    placeholder="예: 대학교 휴학 중, 편의점 아르바이트"
                />
            </div>

            <PsychTestInput data={data} updateData={updateData} />
        </div>
    );
}
