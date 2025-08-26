/*
  # 出張規程管理

  1. New Tables
    - `travel_regulations`
      - `id` (uuid, primary key)
      - `company_id` (uuid, references user_profiles for company association)
      - `company_name` (text)
      - `version` (text)
      - `status` (text, default 'draft')
      - `regulation_data` (jsonb) - 規程の全データ
      - `domestic_allowance` (jsonb) - 国内日当設定
      - `overseas_allowance` (jsonb) - 海外日当設定
      - `created_by` (uuid, references user_profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `travel_regulations` table
    - Add policies for company users to manage their regulations
*/

-- 出張規程テーブル
CREATE TABLE IF NOT EXISTS travel_regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  version text NOT NULL DEFAULT 'v1.0',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  regulation_data jsonb NOT NULL DEFAULT '{}',
  domestic_allowance jsonb NOT NULL DEFAULT '{"executive": 8000, "manager": 6000, "general": 5000}',
  overseas_allowance jsonb NOT NULL DEFAULT '{"executive": 12000, "manager": 9000, "general": 7500}',
  distance_threshold integer DEFAULT 50,
  created_by uuid REFERENCES user_profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE travel_regulations ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "Users can manage company regulations"
  ON travel_regulations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (company_name = (SELECT company_name FROM user_profiles WHERE id = company_id) OR role = 'admin')
    )
  );

-- 更新日時の自動更新
CREATE TRIGGER update_travel_regulations_updated_at
  BEFORE UPDATE ON travel_regulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();