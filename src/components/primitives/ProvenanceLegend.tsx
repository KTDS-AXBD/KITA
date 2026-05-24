import { DataMark } from '../DataMark';

export function ProvenanceLegend(): JSX.Element {
  return (
    <div className="legend-bar">
      <span>표기:</span>
      <span>
        <DataMark kind="real" /> GIVC 또는 외부 출처 실데이터
      </span>
      <span>
        <DataMark kind="est" /> 우리가 합리적으로 추론한 값
      </span>
      <span>
        <DataMark kind="virt" /> 시연용 가상 데이터
      </span>
    </div>
  );
}
