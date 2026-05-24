import type { NewsWord } from '@/types';

interface WordCloudProps {
  words: NewsWord[];
}

export function WordCloud({ words }: WordCloudProps): JSX.Element {
  return (
    <div className="wordcloud">
      {words.map((w, i) => (
        <span key={i} className={`word ${w.t}`} style={{ fontSize: 12 + w.s * 0.5 }}>
          {w.w}
        </span>
      ))}
    </div>
  );
}
