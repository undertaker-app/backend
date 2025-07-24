-- PostgreSQL 초기화 스크립트
-- 이 파일은 PostgreSQL 컨테이너가 처음 시작될 때 실행됩니다.

-- 필요한 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 데이터베이스가 제대로 생성되었는지 확인
SELECT 'Database initialized successfully!' as message; 