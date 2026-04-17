-- ============================================================
-- 杭州滨江开元名都大酒店 · Supabase 数据库建表脚本
-- 版本: v1.0
-- 包含:
--   1. wedding_show_registrations  婚礼秀报名
--   2. customer_feedback           客户反馈/工单
--   3. wedding_plan_inquiries      婚宴咨询（智能匹配记录）
-- 所有表均启用 RLS，允许匿名用户提交
-- ============================================================


-- ============================================================
-- 表 1: wedding_show_registrations（婚礼秀报名）
-- ============================================================
CREATE TABLE IF NOT EXISTS wedding_show_registrations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_name           TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  wechat                TEXT,
  wedding_date          DATE,
  guest_count           TEXT,             -- 范围值: "10-20", "20-30" 等
  budget                TEXT,             -- 范围值: "6000-8000" 等
  remarks               TEXT,
  event_name            TEXT NOT NULL DEFAULT '春日赴约婚礼秀',
  registration_time     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status                TEXT NOT NULL DEFAULT 'registered',
                        -- registered | confirmed | cancelled | attended
  reminder_1day_sent    BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_2hours_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_wsr_phone ON wedding_show_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_wsr_event_name ON wedding_show_registrations(event_name);
CREATE INDEX IF NOT EXISTS idx_wsr_status ON wedding_show_registrations(status);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wedding_show_registrations_updated_at
  BEFORE UPDATE ON wedding_show_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE wedding_show_registrations ENABLE ROW LEVEL SECURITY;

-- 匿名用户可提交报名
CREATE POLICY "allow_anon_insert_wedding_show"
  ON wedding_show_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 用户可按手机号查询自己的报名记录
CREATE POLICY "allow_anon_select_own_wedding_show"
  ON wedding_show_registrations
  FOR SELECT
  TO anon
  USING (true);  -- 如需限制只查自己的，改为: phone = current_setting('request.jwt.claims', true)::json->>'phone'

-- 管理员（authenticated）可全部操作
CREATE POLICY "allow_auth_all_wedding_show"
  ON wedding_show_registrations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 表 2: customer_feedback（客户反馈/工单）
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_feedback (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id         TEXT NOT NULL UNIQUE,  -- 格式: TK-{timestamp}-{random}
  feedback_type     TEXT NOT NULL,
                    -- general | booking | complaint | cooperation
                    -- recruitment | lost-found | vip
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT,
  wechat            TEXT,
  subject           TEXT NOT NULL,
  content           TEXT NOT NULL,
  preferred_contact TEXT,                  -- phone | wechat | email
  expected_time     TEXT,                  -- asap | today | tomorrow | week
  attachments       JSONB,                 -- [{name, url, size, type}]
  status            TEXT NOT NULL DEFAULT 'submitted',
                    -- submitted | assigned | processing | responded | completed
  priority          TEXT NOT NULL DEFAULT 'normal',
                    -- normal | high | urgent
  assigned_to       TEXT,                  -- 处理人员
  response_content  TEXT,                  -- 回复内容
  response_time     TIMESTAMPTZ,           -- 首次回复时间
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cf_ticket_id ON customer_feedback(ticket_id);
CREATE INDEX IF NOT EXISTS idx_cf_phone ON customer_feedback(phone);
CREATE INDEX IF NOT EXISTS idx_cf_status ON customer_feedback(status);
CREATE INDEX IF NOT EXISTS idx_cf_priority ON customer_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_cf_feedback_type ON customer_feedback(feedback_type);

-- 自动更新 updated_at
CREATE TRIGGER update_customer_feedback_updated_at
  BEFORE UPDATE ON customer_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

-- 匿名用户可提交反馈
CREATE POLICY "allow_anon_insert_feedback"
  ON customer_feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 匿名用户可按 ticket_id 查询进度
CREATE POLICY "allow_anon_select_feedback"
  ON customer_feedback
  FOR SELECT
  TO anon
  USING (true);

-- 管理员可全部操作
CREATE POLICY "allow_auth_all_feedback"
  ON customer_feedback
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 表 3: wedding_plan_inquiries（婚宴咨询/智能匹配记录）
-- ============================================================
CREATE TABLE IF NOT EXISTS wedding_plan_inquiries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_name         TEXT NOT NULL,
  phone               TEXT NOT NULL,
  wedding_date        DATE,
  table_count         INTEGER,             -- 桌数
  budget_per_table    TEXT,               -- 范围值: "6000-8000" 等
  wedding_style       TEXT,               -- diy | one-stop | outdoor | budget
  remarks             TEXT,
  recommended_halls   TEXT[],             -- 推荐场地 ID 数组: ["mingdu", "kaiyuan"]
  status              TEXT NOT NULL DEFAULT 'pending',
                      -- pending | contacted | visiting | signed | lost
  consultant_assigned TEXT,               -- 分配的顾问
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_wpi_phone ON wedding_plan_inquiries(phone);
CREATE INDEX IF NOT EXISTS idx_wpi_wedding_date ON wedding_plan_inquiries(wedding_date);
CREATE INDEX IF NOT EXISTS idx_wpi_status ON wedding_plan_inquiries(status);

-- 自动更新 updated_at
CREATE TRIGGER update_wedding_plan_inquiries_updated_at
  BEFORE UPDATE ON wedding_plan_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE wedding_plan_inquiries ENABLE ROW LEVEL SECURITY;

-- 匿名用户可提交咨询
CREATE POLICY "allow_anon_insert_wedding_inquiry"
  ON wedding_plan_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 匿名用户可查询
CREATE POLICY "allow_anon_select_wedding_inquiry"
  ON wedding_plan_inquiries
  FOR SELECT
  TO anon
  USING (true);

-- 管理员可全部操作
CREATE POLICY "allow_auth_all_wedding_inquiry"
  ON wedding_plan_inquiries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 验证建表结果
-- ============================================================
-- 运行以下语句确认三张表已创建成功：
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('wedding_show_registrations', 'customer_feedback', 'wedding_plan_inquiries');
