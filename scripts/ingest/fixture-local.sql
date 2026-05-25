-- F016 — 로컬 D1 Worker 스모크용 소량 픽스처(API 호출 없이 /api/givc/* 검증).
--   적용: db:migrate:local → 본 픽스처 --local → build-graph --local → ingest-fts --local → wrangler dev.
--   ⚠️ 실데이터 아님(시연/배포는 원격 D1 + ingest:all). 로컬 엔드포인트 동작 확인 전용.
DELETE FROM trade_stats; DELETE FROM trade_by_country; DELETE FROM companies;
INSERT INTO trade_stats(hs_code,period,exports,imports,unit,provenance) VALUES
 ('290230','2024Q1',1000,2000,'USD','real'),
 ('290230','2024Q2',1100,2100,'USD','real'),
 ('290230','2024Q3',1050,1900,'USD','real'),
 ('290230','2024Q4',1200,2200,'USD','real');
INSERT INTO trade_by_country(hs_code,cnty_cd,cnty_nm,exports,imports,share,provenance) VALUES
 ('290230','JP','일본',500,1640,0.82,'real'),
 ('290230','CN','중국',300,360,0.18,'real'),
 ('290230','US','미국',200,100,0.05,'real');
INSERT INTO companies(id,corp_code,name,biz,sales,share,core_type,role,provenance) VALUES
 ('00165413','00165413','롯데케미칼(주)','기초 석유화학 제품 제조','20.4조','—',1,'원료공급','real'),
 ('00106368','00106368','금호석유화학(주)','합성고무·합성수지','—','—',2,'후방수요·가공','real');
