import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 接続テスト関数
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error && error.code === 'PGRST116') {
      // テーブルが存在しない場合は正常（接続は成功）
      return { success: true, message: 'Supabase接続成功' };
    }
    
    if (error) {
      return { success: false, message: `接続エラー: ${error.message}` };
    }
    
    return { success: true, message: 'Supabase接続成功' };
  } catch (error) {
    return { 
      success: false, 
      message: `接続エラー: ${error instanceof Error ? error.message : '不明なエラー'}` 
    };
  }
}