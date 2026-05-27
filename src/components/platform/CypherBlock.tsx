type TokenType = 'keyword' | 'entity' | 'prop' | 'comment' | 'text';
interface Token { type: TokenType; value: string }

const KEYWORDS = new Set([
  'MATCH','WHERE','RETURN','WITH','AS','LIMIT','ORDER','BY','CREATE','MERGE','SET',
  'DELETE','DETACH','OPTIONAL','UNION','CALL','YIELD','NOT','AND','OR','IN','IS',
  'NULL','TRUE','FALSE','CASE','WHEN','THEN','ELSE','END','DISTINCT','COUNT',
  'COLLECT','SUM','AVG','MIN','MAX','EXISTS','UNWIND','FOREACH','REMOVE','ON',
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const val = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ type: 'comment', value: val });
      i += val.length;
      continue;
    }
    // node pattern (...)
    if (code[i] === '(') {
      const end = code.indexOf(')', i);
      if (end !== -1) {
        tokens.push({ type: 'entity', value: code.slice(i, end + 1) });
        i = end + 1;
        continue;
      }
    }
    // property map {...}
    if (code[i] === '{') {
      const end = code.indexOf('}', i);
      if (end !== -1) {
        tokens.push({ type: 'prop', value: code.slice(i, end + 1) });
        i = end + 1;
        continue;
      }
    }
    // word — keyword check
    const ch = code[i] ?? '';
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < code.length && /[A-Za-z0-9_]/.test(code[j] ?? '')) j++;
      const word = code.slice(i, j);
      tokens.push({ type: KEYWORDS.has(word.toUpperCase()) ? 'keyword' : 'text', value: word });
      i = j;
      continue;
    }
    // everything else — merge with previous text token if possible
    const last = tokens[tokens.length - 1];
    if (last?.type === 'text') {
      last.value += ch;
    } else {
      tokens.push({ type: 'text', value: ch });
    }
    i++;
  }
  return tokens;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: '#89B4FA',
  entity: '#A6E3A1',
  prop: '#F9E2AF',
  comment: '#6C7086',
  text: '#CDD6F4',
};

interface CypherBlockProps {
  code: string;
}

export function CypherBlock({ code }: CypherBlockProps): JSX.Element {
  const tokens = tokenize(code);
  return (
    <pre
      style={{
        background: '#1E1E2E',
        color: '#CDD6F4',
        borderRadius: 'var(--op-radius-sm)',
        padding: '20px 24px',
        fontFamily: 'var(--op-font-mono)',
        fontSize: 12,
        lineHeight: 1.8,
        overflowX: 'auto',
        margin: 0,
        border: '1px solid #313244',
      }}
    >
      {tokens.map((tok, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[tok.type], fontStyle: tok.type === 'comment' ? 'italic' : undefined }}>
          {tok.value}
        </span>
      ))}
    </pre>
  );
}
