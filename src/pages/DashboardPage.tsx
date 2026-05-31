import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { Submission } from '../types';
import StatusBadge from '../components/StatusBadge';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const snap = await getDocs(collection(db, 'submissions'));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate(),
        updatedAt: d.data().updatedAt?.toDate(),
      })) as Submission[];
      data.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      setSubmissions(data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  const STAT_CARDS = [
    { label: 'Toplam Gönderim', value: stats.total, icon: ClipboardList, color: 'text-delphi-600', bg: 'bg-delphi-50', border: 'border-delphi-200' },
    { label: 'Beklemede', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Onaylanan', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Reddedilen', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  ];

  // Per-user stats
  const userStats = submissions.reduce((acc, s) => {
    if (!acc[s.userId]) {
      acc[s.userId] = { name: s.userName, total: 0, pending: 0, approved: 0, rejected: 0 };
    }
    acc[s.userId].total++;
    acc[s.userId][s.status]++;
    return acc;
  }, {} as Record<string, { name: string; total: number; pending: number; approved: number; rejected: number }>);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`bg-white border ${border} rounded-xl p-4`}>
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{loading ? '—' : value}</p>
            <p className={`text-sm font-medium ${color} mt-1`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Son Gönderimler</h2>
          <Link to="/submissions" className="text-sm text-delphi-500 hover:underline font-medium">
            Tümünü gör
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Yükleniyor...</p>
          ) : submissions.slice(0, 8).length === 0 ? (
            <p className="text-center text-gray-400 py-8">Henüz gönderim yok</p>
          ) : (
            submissions.slice(0, 8).map(s => (
              <Link
                key={s.id}
                to={`/submissions/${s.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.productCode}</p>
                  <p className="text-xs text-gray-500">{s.userName} · {s.dealerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {s.createdAt?.toLocaleDateString('tr-TR')}
                  </span>
                  <StatusBadge status={s.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Per-user table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Distribütör Bazlı Özet</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Distribütör</th>
                <th className="px-5 py-3 text-center">Toplam</th>
                <th className="px-5 py-3 text-center">Beklemede</th>
                <th className="px-5 py-3 text-center">Onaylanan</th>
                <th className="px-5 py-3 text-center">Reddedilen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.values(userStats).map((u, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-5 py-3 text-center font-bold text-delphi-600">{u.total}</td>
                  <td className="px-5 py-3 text-center text-amber-600">{u.pending}</td>
                  <td className="px-5 py-3 text-center text-green-600">{u.approved}</td>
                  <td className="px-5 py-3 text-center text-red-600">{u.rejected}</td>
                </tr>
              ))}
              {Object.keys(userStats).length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                    Henüz veri yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
