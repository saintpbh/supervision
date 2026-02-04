import { ReportData } from '../../lib/types';
import '../Styles.css';

interface Props {
    data: ReportData;
    updateData: (key: keyof ReportData, value: string) => void;
}

export default function Step1_Core({ data, updateData }: Props) {
    return (
        <div className="step-container fade-in">
            <h2 className="step-title">1단계: 핵심 질문 (1분)</h2>
            <p className="step-description">
                작성을 시작하기 전에 먼저 답해보세요: <strong>왜 이 사례가 불편하게 느껴지나요?</strong><br />
                이것이 보고서의 '닻(Anchor)'이 됩니다.
            </p>

            <div className="input-group">
                <label className="label">나의 핵심 어려움 / 망설임</label>
                <textarea
                    className="textarea focus-input"
                    value={data.coreQuestion}
                    onChange={(e) => updateData('coreQuestion', e.target.value)}
                    placeholder="예: '내담자의 취약함 때문에 직면하기가 망설여진다.', '내담자의 침묵이 나를 불안하게 한다.'"
                    autoFocus
                    style={{ minHeight: '150px', fontSize: '1.2rem' }}
                />
            </div>
        </div>
    );
}
