-- F016/F023 — 로컬 D1 Worker 스모크용 소량 픽스처(API 호출 없이 /api/givc/* 검증).
--   적용: db:migrate:local → 본 픽스처 --local → build-graph --local → ingest-fts --local → wrangler dev.
--   ⚠️ 실데이터 아님(시연/배포는 원격 D1 + ingest:all). 로컬 엔드포인트 동작 확인 전용. 기계 가치사슬(앵커 845710).
DELETE FROM trade_stats; DELETE FROM trade_by_country; DELETE FROM companies;
INSERT INTO trade_stats(hs_code,period,exports,imports,unit,provenance) VALUES
 ('845710','2024Q1',120,40,'USD','real'),  -- 머시닝센터(장비, 흑자)
 ('845710','2024Q2',136,38,'USD','real'),
 ('848340','2024Q1',81,124,'USD','real'),  -- 감속기(부품, 적자=자립화)
 ('848210','2024Q1',94,94,'USD','real'),   -- 베어링(부품)
 ('722840','2024Q1',2,12,'USD','real');    -- 특수강(소재, 적자)
INSERT INTO trade_by_country(hs_code,cnty_cd,cnty_nm,exports,imports,share,provenance) VALUES
 ('845710','JP','일본',50,138,0.61,'real'),
 ('845710','DE','독일',30,65,0.29,'real'),
 ('845710','CN','중국',20,23,0.10,'real');
INSERT INTO companies(id,corp_code,name,biz,sales,share,core_type,role,tier,provenance) VALUES
 ('00166519','00166519','화천기공(주)','완성 장비(머시닝센터·공작기계)','2,222억','12%',1,'완성 장비(머시닝센터·공작기계)','장비','real'),
 ('00220686','00220686','(주)에스피지','정밀 감속기·기어드모터 — 자립화','3,885억','21%',1,'정밀 감속기·기어드모터 — 자립화','부품','real'),
 ('00106669','00106669','(주)세아베스틸지주','특수강 — 베어링·기어 소재','3.6조','20%',2,'특수강 — 베어링·기어 소재','소재','real');
