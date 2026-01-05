import { createClient } from '@supabase/supabase-js';

// 環境変数から情報を読み込む（!は、値が必ずあることをTypeScriptに伝える記号です）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ここで「export」を付けることで、他のファイルから import { supabase } ができるようになります
export const supabase = createClient(supabaseUrl, supabaseAnonKey);