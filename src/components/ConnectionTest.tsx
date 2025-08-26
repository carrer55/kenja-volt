import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';
import { testConnection } from '../lib/supabase';

function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<{
    loading: boolean;
    success: boolean | null;
    message: string;
  }>({
    loading: true,
    success: null,
    message: ''
  });

  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus({ loading: true, success: null, message: '' });
      
      try {
        const result = await testConnection();
        setConnectionStatus({
          loading: false,
          success: result.success,
          message: result.message
        });
      } catch (error) {
        setConnectionStatus({
          loading: false,
          success: false,
          message: `接続テストエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
        });
      }
    };

    checkConnection();
  }, []);

  const handleRetry = () => {
    setConnectionStatus({ loading: true, success: null, message: '' });
    setTimeout(async () => {
      try {
        const result = await testConnection();
        setConnectionStatus({
          loading: false,
          success: result.success,
          message: result.message
        });
      } catch (error) {
        setConnectionStatus({
          loading: false,
          success: false,
          message: `接続テストエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
        });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23334155%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="backdrop-blur-xl bg-white/20 rounded-xl p-8 lg:p-12 border border-white/30 shadow-2xl">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center">
                <Database className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                Supabase接続テスト
              </h1>
              <p className="text-slate-600">データベース接続の確認を行っています</p>
            </div>

            {/* 接続状況表示 */}
            <div className="backdrop-blur-xl bg-white/20 rounded-lg p-6 border border-white/30 mb-8">
              <div className="flex items-center justify-center space-x-4">
                {connectionStatus.loading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-navy-600 animate-spin" />
                    <span className="text-slate-700 font-medium">接続確認中...</span>
                  </>
                ) : connectionStatus.success ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">{connectionStatus.message}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-600" />
                    <span className="text-red-700 font-medium">{connectionStatus.message}</span>
                  </>
                )}
              </div>
            </div>

            {/* 接続情報 */}
            <div className="backdrop-blur-xl bg-white/20 rounded-lg p-6 border border-white/30 mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">接続情報</h3>
              <div className="text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Project URL:</span>
                  <span className="text-slate-800 font-mono text-xs">tijmpjkcqvxbdygkjxtw.supabase.co</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">API Key:</span>
                  <span className="text-slate-800 font-mono text-xs">eyJ...zyg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className={`font-medium ${
                    connectionStatus.loading ? 'text-amber-600' :
                    connectionStatus.success ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {connectionStatus.loading ? '確認中' :
                     connectionStatus.success ? '接続成功' : '接続失敗'}
                  </span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetry}
                disabled={connectionStatus.loading}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 text-white rounded-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database className="w-5 h-5" />
                <span>{connectionStatus.loading ? '確認中...' : '再テスト'}</span>
              </button>
            </div>

            {connectionStatus.success && (
              <div className="mt-6 text-emerald-700 text-sm">
                ✅ Supabaseへの接続が正常に確立されました。テーブル作成の準備が整いました。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectionTest;