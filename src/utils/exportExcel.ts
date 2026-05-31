import * as XLSX from 'xlsx';
import { Submission } from '../types';

export function exportSubmissionsToExcel(submissions: Submission[]) {
  const rows = submissions.map(s => ({
    'Ürün Kodu': s.productCode,
    'Seri Numarası': s.serialNumber,
    'Distribütör': s.userName,
    'Bayi': s.dealerName,
    'Fatura No': s.invoiceNumber,
    'Fatura Tarihi': s.invoiceDate,
    'Fatura Tutarı (₺)': s.invoiceAmount,
    'Durum': s.status === 'pending' ? 'Beklemede' : s.status === 'approved' ? 'Onaylandı' : 'Reddedildi',
    'Yönetici Notu': s.adminNote || '',
    'Gönderim Tarihi': s.createdAt?.toLocaleDateString('tr-TR') || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  // Kolon genişlikleri
  worksheet['!cols'] = [
    { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    { wch: 15 }, { wch: 14 }, { wch: 18 }, { wch: 12 },
    { wch: 30 }, { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gönderimler');
  const date = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
  XLSX.writeFile(workbook, `garanti-gonderimler-${date}.xlsx`);
}
