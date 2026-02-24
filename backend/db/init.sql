-- UUID拡張の有効化（PostgreSQL 13以降は標準で利用可能ですが、一応）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 傷病者データを保存するテーブル
CREATE TABLE IF NOT EXISTS casualties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 日付/時刻
  patient_name TEXT NOT NULL,                        -- 名前
  university TEXT,                                   -- 大学名
  grade TEXT,                                        -- 学年
  position TEXT,                                     -- ポジション
  location_detail TEXT,                             -- 受傷時間・場所
  injury_detail TEXT,                               -- 受傷の詳細
  treatment TEXT,                                    -- 対応・処置
  transport_needed TEXT,                            -- 受診・緊急搬送の必要性
  staff_contact TEXT,                               -- チームスタッフ連絡
  responder TEXT,                                    -- 対応者
  remarks TEXT,                                      -- 備考
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
