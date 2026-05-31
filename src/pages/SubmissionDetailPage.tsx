import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Submission } from '../types';
import { sendStatusEmail } from '../utils/emailService';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, 'submissions', id));
      if (snap.exists()) {
        const data = {
          id: snap.id,
          ...snap.data(),
          createdAt: snap.data().createdAt?.toDate(),
          updatedAt: snap.data().updatedAt?.toDate(),
        } as Submission;
        setSubmission(data);
        setNote(data.adminNote || '');
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!id || !submission) return;
    if (action === 'rejected' && !note.trim()) {
      alert('Reddetmek için lütfen bir not giriniz.');
      return;
    }
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'submissions', id), {
        status: action,
        adminNote: note.trim() || null,
        updatedAt: serverTimestamp(),
      });

      // Distribütöre e-posta gönder
      await sendStatusEmail({
        to_email: submission.userName, // userName'de email tutuluyorsa
        to_name: submission.userName,
        product_code: submission.productCode,
        serial_number: submission.serialNumber,
        status: action,
        admin_note: note.trim(),
      });

      // Push bildirimi gönder
      try {
        const userSnap = await getDocs(
          query(collection(db, 'users'), where('uid', '==', submission.userId))
        );
        if (!userSnap.empty) {
          const pushToken = userSnap.docs[0].data().pushToken;
          if (pushToken) {
            await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: pushToken,
                sound: 'default',
                title: action === 'approved' ? '✓ Ürün Onaylandı' : '✗ Ürün Reddedildi',
                body: `${submission.productCode} - ${submission.serialNumber}`,
                data: { submissionId: id },
              }),
            });
          }
        }
      } catch (e) {
        console.error('Push gönderilemedi:', e);
      }

      setSubmission(prev => prev ? { ...prev, status: action, adminNote: note.trim() } : prev);
    } catch (e) {
      alert('İşlem sırasında hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-delphi-500 border-t-transparent" />
      </div>
    );
  }

  if (!submission) {
    return <p className="text-gray-500 text-center py-20">Gönderim bulunamadı.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{submission.productCode}</h1>
          <p className="text-sm text-gray-500">Seri No: {submission.serialNumber}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ürün Bilgileri */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Ürün Bilgileri
            </h2>
            <dl className="space-y-3">
              <InfoRow label="Ürün Kodu" value={submission.productCode} />
              <InfoRow label="Seri Numarası" value={submission.serialNumber} />
              <InfoRow label="Distribütör" value={submission.userName} />
              <InfoRow label="Bayi" value={submission.dealerName} />
              <InfoRow label="Gönderim Tarihi" value={submission.createdAt?.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })} />
            </dl>
          </div>

          {/* Fatura Bilgileri */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Fatura Bilgileri
            </h2>
            <dl className="space-y-3">
              <InfoRow label="Fatura Numarası" value={submission.invoiceNumber} />
              <InfoRow label="Fatura Tarihi" value={submission.invoiceDate} />
              <InfoRow label="Fatura Tutarı" value={`₺${submission.invoiceAmount}`} />
            </dl>
          </div>

          {/* Ürün Fotoğrafları */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Ürün Fotoğrafları ({submission.productPhotos.length})
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {submission.productPhotos.map((url, i) => (
                <div
                  key={i}
                  className="relative group cursor-pointer"
                  onClick={() => setPreviewImg(url)}
                >
                  <img
                    src={url}
                    alt={`Ürün ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink size={18} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fatura Fotoğrafı */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Fatura Fotoğrafı
            </h2>
            <div
              className="relative group cursor-pointer"
              onClick={() => setPreviewImg(submission.invoicePhoto)}
            >
              <img
                src={submission.invoicePhoto}
                alt="Fatura"
                className="w-full max-h-72 object-contain rounded-lg border border-gray-200 bg-gray-50"
              />
              <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <h2 className="font-semibold text-gray-800 mb-4">İşlem Yap</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yönetici Notu
                {submission.status !== 'approved' && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-delphi-500 resize-none"
                placeholder="Onay/red açıklaması..."
                disabled={submission.status !== 'pending'}
              />
            </div>

            {submission.status === 'pending' ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleAction('approved')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  <CheckCircle size={17} />
                  Onayla
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  <XCircle size={17} />
                  Reddet
                </button>
              </div>
            ) : (
              <div className={`text-center py-3 rounded-lg text-sm font-semibold
                ${submission.status === 'approved'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'}`}
              >
                {submission.status === 'approved' ? '✓ Onaylandı' : '✗ Reddedildi'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="Önizleme"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            onClick={() => setPreviewImg(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-semibold text-gray-900 text-right">{value}</dd>
    </div>
  );
}
