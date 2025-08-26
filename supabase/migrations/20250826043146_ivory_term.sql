/*
  # 経費申請管理

  1. New Tables
    - `expense_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `total_amount` (integer)
      - `status` (text, default 'draft')
      - `submitted_at` (timestamp)
      - `approved_at` (timestamp)
      - `approver_id` (uuid)
      - `approval_comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `expense_items`
      - `id` (uuid, primary key)
      - `expense_application_id` (uuid, references expense_applications)
      - `category` (text)
      - `date` (date)
      - `amount` (integer)
      - `description` (text)
      - `receipt_url` (text)
      - `ocr_data` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for users and approvers
*/

-- 経費申請テーブル
CREATE TABLE IF NOT EXISTS expense_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT '経費申請',
  total_amount integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'returned')),
  submitted_at timestamptz,
  approved_at timestamptz,
  approver_id uuid REFERENCES user_profiles(id),
  approval_comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 経費項目テーブル
CREATE TABLE IF NOT EXISTS expense_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_application_id uuid REFERENCES expense_applications(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('交通費', '宿泊費', '日当', '雑費')),
  date date NOT NULL,
  amount integer NOT NULL,
  description text DEFAULT '',
  receipt_url text,
  ocr_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE expense_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

-- 経費申請ポリシー
CREATE POLICY "Users can manage own expense applications"
  ON expense_applications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Approvers can view pending expense applications"
  ON expense_applications
  FOR SELECT
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('approver', 'admin')
    )
  );

CREATE POLICY "Approvers can update expense application status"
  ON expense_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('approver', 'admin')
    )
  );

-- 経費項目ポリシー
CREATE POLICY "Users can manage own expense items"
  ON expense_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expense_applications 
      WHERE id = expense_application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can view expense items"
  ON expense_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expense_applications ea
      JOIN user_profiles up ON up.id = auth.uid()
      WHERE ea.id = expense_application_id 
      AND (ea.user_id = auth.uid() OR up.role IN ('approver', 'admin'))
    )
  );

-- 更新日時の自動更新
CREATE TRIGGER update_expense_applications_updated_at
  BEFORE UPDATE ON expense_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();