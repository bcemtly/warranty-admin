import emailjs from '@emailjs/browser';

// EmailJS kurulumu için: https://www.emailjs.com
// 1. Ücretsiz hesap açın
// 2. Email Service ekleyin (Gmail önerilir)
// 3. Template oluşturun (aşağıdaki değişkenleri kullanın)
// 4. Aşağıdaki değerleri doldurun

const SERVICE_ID = 'EMAILJS_SERVICE_ID';    // EmailJS > Email Services
const APPROVAL_TEMPLATE_ID = 'EMAILJS_APPROVAL_TEMPLATE'; // Onay/red şablonu
const ADMIN_TEMPLATE_ID = 'EMAILJS_ADMIN_TEMPLATE';       // Admin bildirim şablonu
const PUBLIC_KEY = 'EMAILJS_PUBLIC_KEY';    // EmailJS > Account > Public Key

// Distribütöre onay/red bildirimi
export async function sendStatusEmail(params: {
  to_email: string;
  to_name: string;
  product_code: string;
  serial_number: string;
  status: 'approved' | 'rejected';
  admin_note?: string;
}) {
  if (SERVICE_ID === 'EMAILJS_SERVICE_ID') return; // Henüz yapılandırılmadı

  try {
    await emailjs.send(SERVICE_ID, APPROVAL_TEMPLATE_ID, {
      to_email: params.to_email,
      to_name: params.to_name,
      product_code: params.product_code,
      serial_number: params.serial_number,
      status_text: params.status === 'approved' ? 'ONAYLANDI ✓' : 'REDDEDİLDİ ✗',
      admin_note: params.admin_note || 'Not girilmedi.',
    }, PUBLIC_KEY);
  } catch (error) {
    console.error('E-posta gönderilemedi:', error);
  }
}

// Yöneticiye yeni gönderim bildirimi
export async function sendNewSubmissionEmail(params: {
  admin_email: string;
  distributor_name: string;
  product_code: string;
  serial_number: string;
  dealer_name: string;
}) {
  if (SERVICE_ID === 'EMAILJS_SERVICE_ID') return;

  try {
    await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE_ID, {
      to_email: params.admin_email,
      distributor_name: params.distributor_name,
      product_code: params.product_code,
      serial_number: params.serial_number,
      dealer_name: params.dealer_name,
    }, PUBLIC_KEY);
  } catch (error) {
    console.error('Admin e-postası gönderilemedi:', error);
  }
}
