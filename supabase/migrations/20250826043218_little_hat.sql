/*
  # 承認ワークフロー管理

  1. New Tables
    - `approval_workflows`
      - `id` (uuid, primary key)
      - `application_id` (uuid) - 申請ID（出張・経費共通）
      - `application_type` (text) - 申請種別
      - `step_number` (integer) - 承認ステップ番号
      - `approver_id` (uuid, references user_profiles)
      - `status` (text, default 'pending')
      - `approved_at` (timestamp)
      - `comment` (text)
      - `created_at` (timestamp)
    
    - `approval_settings`
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `workflow_config` (jsonb) - ワークフロー設定
      - `reminder_settings` (jsonb) - リマインド設定
      - `created_by` (uuid, references user_profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for workflow management
*/

-- 承認ワークフローテーブル
CREATE TABLE IF NOT EXISTS approval_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  application_type text NOT NULL CHECK (application_type IN ('business_trip', 'expense')),
  step_number integer NOT NULL,
  approver_id uuid REFERENCES user_profiles(id) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
  approved_at timestamptz,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- 承認設定テーブル
CREATE TABLE IF NOT EXISTS approval_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  workflow_config jsonb NOT NULL DEFAULT '{"steps": [{"role": "approver", "required": true}]}',
  reminder_settings jsonb NOT NULL DEFAULT '{"enabled": true, "days": [7, 14]}',
  created_by uuid REFERENCES user_profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_settings ENABLE ROW LEVEL SECURITY;

-- 承認ワークフローポリシー
CREATE POLICY "Users can view workflows for their applications"
  ON approval_workflows
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_trip_applications bta 
      WHERE bta.id = application_id AND bta.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM expense_applications ea 
      WHERE ea.id = application_id AND ea.user_id = auth.uid()
    ) OR
    approver_id = auth.uid()
  );

CREATE POLICY "Approvers can update workflows"
  ON approval_workflows
  FOR UPDATE
  TO authenticated
  USING (approver_id = auth.uid());

CREATE POLICY "System can insert workflows"
  ON approval_workflows
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 承認設定ポリシー
CREATE POLICY "Users can manage company approval settings"
  ON approval_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (company_name = approval_settings.company_name OR role = 'admin')
    )
  );

-- 更新日時の自動更新
CREATE TRIGGER update_approval_settings_updated_at
  BEFORE UPDATE ON approval_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();