import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Dealer } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchDealers = async () => {
    const snap = await getDocs(collection(db, 'dealers'));
    setDealers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Dealer[]);
    setLoading(false);
  };

  useEffect(() => { fetchDealers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setAdding(true);
    try {
      await addDoc(collection(db, 'dealers'), {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        createdAt: serverTimestamp(),
      });
      setName('');
      setCode('');
      fetchDealers();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu bayiyi silmek istediğinize emin misiniz?')) return;
    await deleteDoc(doc(db, 'dealers', id));
    setDealers(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bayiler</h1>

      {/* Add form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Yeni Bayi Ekle</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Bayi Kodu (örn: BY001)"
            className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-delphi-500"
            required
          />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Bayi Adı"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-delphi-500"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 bg-delphi-500 hover:bg-delphi-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            <Plus size={16} />
            Ekle
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-500">{dealers.length} bayi</span>
        </div>
        {loading ? (
          <p className="text-center text-gray-400 py-10">Yükleniyor...</p>
        ) : dealers.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Henüz bayi eklenmemiş</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {dealers.map(dealer => (
              <li key={dealer.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="font-medium text-gray-900">{dealer.name}</span>
                  <span className="ml-2 text-xs bg-delphi-50 text-delphi-600 font-mono px-2 py-0.5 rounded">
                    {dealer.code}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(dealer.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
