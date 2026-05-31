import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { Submission, SubmissionStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { Search, Download } from 'lucide-react';
import { exportSubmissionsToExcel } from '../utils/exportExcel';

const FILTERS: { key: 'all' | SubmissionStatus; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'pending', label: 'Beklemede' },
  { key: 'approved', label: 'Onaylanan' },
  { key: 'rejected', label: 'Reddedilen' },
];

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | SubmissionStatus>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, 'submissions'));
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate(),
        updatedAt: d.data().updatedAt?.toDate(),
      })) as Submission[];
      list.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      setSubmissions(list);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = submissions
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.productCode.toLowerCase().includes(q) ||
        s.serialNumber.toLowerCase().includes(q) ||
        s.userName.toLowerCase().includes(q) ||
        s.dealerName.toLowerCase().includes(q) ||
        s.invoiceNumber.toLowerCase().includes(q)
      );
    });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gönderimler</h1>

      <div className="flex justify-end mb-3">
        <button
          onClick={() => exportSubmissionsToExcel(filtered)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Download size={16} />
          Excel'e Aktar ({filtered.length})
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ürün kodu, seri no, distribütör, bayi ara..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-delphi-500"
            />
          </div>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-delphi-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Ürün Kodu</th>
                <th className="px-5 py-3">Seri No</th>
                <th className="px-5 py-3">Distribütör</th>
                <th className="px-5 py-3">Bayi</th>
                <th className="px-5 py-3">Fatura No</th>
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">Yükleniyor...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">Gönderim bulunamadı</td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-gray-900">{s.productCode}</td>
                    <td className="px-5 py-3 text-gray-600">{s.serialNumber}</td>
                    <td className="px-5 py-3 text-gray-700">{s.userName}</td>
                    <td className="px-5 py-3 text-delphi-600 font-medium">{s.dealerName}</td>
                    <td className="px-5 py-3 text-gray-500">{s.invoiceNumber}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {s.createdAt?.toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/submissions/${s.id}`}
                        className="text-delphi-500 hover:text-delphi-700 font-medium text-xs"
                      >
                        İncele →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          {filtered.length} gönderim listeleniyor
        </div>
      </div>
    </div>
  );
}
