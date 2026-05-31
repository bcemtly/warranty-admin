import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { AppUser } from '../types';
import { Plus, Trash2, UserCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate(),
    })).filter((u: any) => u.role === 'distributor') as AppUser[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setAdding(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await addDoc(collection(db, 'users'), {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        role: 'distributor',
        createdAt: serverTimestamp(),
      });
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanımda.');
      } else {
        setError('Kullanıcı oluşturulamadı.');
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Distribütörler</h1>

      {/* Add form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Yeni Distribütör / Servis Ekle</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad / Firma</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ahmet Yılmaz"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-delphi-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="kullanici@email.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-delphi-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-delphi-500"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 bg-delphi-500 hover:bg-delphi-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            <Plus size={16} />
            {adding ? 'Ekleniyor...' : 'Kullanıcı Ekle'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100 text-sm text-gray-500">
          {users.length} / 45 kullanıcı
        </div>
        {loading ? (
          <p className="text-center text-gray-400 py-10">Yükleniyor...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Henüz kullanıcı eklenmemiş</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map(user => (
              <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 bg-delphi-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCircle size={20} className="text-delphi-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  Distribütör
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
