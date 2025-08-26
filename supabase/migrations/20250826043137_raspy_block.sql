/*
  # 出張申請管理

  1. New Tables
    - `business_trip_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `purpose` (text)
      - `destination` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `estimated_daily_allowance` (integer)
      - `estimated_transportation` (integer)
      - `estimated_accommodation` (integer)
      - `estimated_total` (integer)
      - `status` (text, default 'draft')
      - `submitted_at` (timestamp)
      - `approved_at` (timestamp)
      - `approver_id` (uuid)
      - `approval_comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `business_trip_applications` table
    - Add policies for users to manage their own applications
    - Add policies for approvers to view and approve applications
*/

-- 出張申請テーブル
CREATE TABLE IF NOT EXISTS business_trip_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  purpose text NOT NULL,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  estimated_daily_allowance integer DEFAULT 0,
  estimated_transportation integer DEFAULT 0,
  estimated_accommodation integer DEFAULT 0,
  estimated_total integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'returned')),
  submitted_at timestamptz,
  approved_at timestamptz,
  approver_id uuid REFERENCES user_profiles(id),
  approval_comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE business_trip_applications ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can manage own applications"
  ON business_trip_applications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Approvers can view pending applications"
  ON business_trip_applications
  FOR SELECT
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('approver', 'admin')
    )
  );

CREATE POLICY "Approvers can update application status"
  ON business_trip_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('approver', 'admin')
    )
  );

-- 更新日時の自動更新
CREATE TRIGGER update_business_trip_applications_updated_at
  BEFORE UPDATE ON business_trip_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();