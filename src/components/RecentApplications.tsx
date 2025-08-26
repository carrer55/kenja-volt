import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useBusinessTrips } from '../hooks/useBusinessTrips';
import { useExpenses } from '../hooks/useExpenses';


interface RecentApplicationsProps {
  onShowDetail: (type: 'business-trip' | 'expense', id: string) => void;
  onNavigate: (view: string) => void;
}

function RecentApplications({ onShowDetail, onNavigate }: RecentApplicationsProps) {
  const { applications: businessTrips } = useBusinessTrips();
  const { applications: expenses } = useExpenses();

  // 最新の申請を統合して表示
  const allApplications = [
    ...businessTrips.slice(0, 2).map(app => ({
      id: app.id,
      date: app.created_at.split('T')[0],
      type: '出張申請' as const,
      applicant: '自分',
      amount: `¥${app.estimated_total.toLocaleString()}`,
      status: getStatusLabel(app.status),
      statusColor: getStatusColor(app.status),
      rawType: 'business-trip' as const
    })),
    ...expenses.slice(0, 2).map(app => ({
      id: app.id,
      date: app.created_at.split('T')[0],
      type: '経費申請' as const,
      applicant: '自分',
      amount: `¥${app.total_amount.toLocaleString()}`,
      status: getStatusLabel(app.status),
      statusColor: getStatusColor(app.status),
      rawType: 'expense' as const
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  function getStatusLabel(status: string) {
    const labels = {
      'draft': '下書き',
      'pending': '承認待ち',
      'approved': '承認済み',
      'rejected': '否認',
      'returned': '差戻し'
    };
    return labels[status as keyof typeof labels] || status;
  }

  function getStatusColor(status: string) {
    const colors = {
      'draft': 'text-slate-700 bg-slate-100',
      'pending': 'text-amber-700 bg-amber-100',
      'approved': 'text-emerald-700 bg-emerald-100',
      'rejected': 'text-red-700 bg-red-100',
      'returned': 'text-orange-700 bg-orange-100'
    };
    return colors[status as keyof typeof colors] || 'text-slate-700 bg-slate-100';
  }
  return (
    <div className="backdrop-blur-xl bg-white/20 rounded-xl p-4 lg:p-6 border border-white/30 shadow-xl relative overflow-hidden">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-white/20 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/10"></div>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-slate-800 relative z-10">最近の申請</h2>
        <button 
          onClick={() => onNavigate('application-status')}
          className="text-slate-400 hover:text-slate-600 relative z-10"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-hidden relative z-10">
        <div className="overflow-x-auto">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2 lg:gap-4 text-xs font-medium text-slate-600 pb-2 border-b border-white/30 min-w-max">
            <span>日付</span>
            <span>種別</span>
            <span>申請者</span>
            <span>金額</span>
            <span>ステータス</span>
          </div>
          {allApplications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              申請がありません
            </div>
          ) : (
            allApplications.map((app, index) => (
            <div 
              key={index} 
              className="grid grid-cols-5 gap-2 lg:gap-4 items-center py-3 hover:bg-white/20 rounded-lg px-2 transition-colors min-w-max cursor-pointer"
              onClick={() => onShowDetail(app.rawType, app.id)}
            >
              <span className="text-slate-700 text-sm">{app.date}</span>
              <span className="text-slate-700 text-sm">{app.type}</span>
              <span className="text-slate-700 text-sm">{app.applicant}</span>
              <span className="text-slate-900 font-medium text-sm">{app.amount}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                {app.status}
              </span>
            </div>
          ))
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default RecentApplications;