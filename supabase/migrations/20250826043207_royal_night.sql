/*
  # 書類管理と通知システム

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `type` (text) - 書類種別
      - `status` (text, default 'draft')
      - `content_data` (jsonb) - 書類の内容データ
      - `file_url` (text) - 生成されたファイルのURL
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `message` (text)
      - `type` (text) - 通知種別
      - `category` (text) - カテゴリ
      - `read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

-- 書類管理テーブル
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'business-report', 'allowance-detail', 'expense-settlement', 
    'travel-detail', 'gps-log', 'monthly-report', 'annual-report'
  )),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'completed')),
  content_data jsonb NOT NULL DEFAULT '{}',
  file_url text,
  file_size text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'push')),
  category text NOT NULL CHECK (category IN ('approval', 'reminder', 'system', 'update')),
  read boolean DEFAULT false,
  related_application_id uuid,
  created_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 書類管理ポリシー
CREATE POLICY "Users can manage own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 通知ポリシー
CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- 更新日時の自動更新
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();