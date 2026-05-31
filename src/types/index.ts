export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Submission {
  id: string;
  userId: string;
  userName: string;
  productCode: string;
  serialNumber: string;
  dealerId: string;
  dealerName: string;
  productPhotos: string[];
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: string;
  invoicePhoto: string;
  status: SubmissionStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dealer {
  id: string;
  name: string;
  code: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'distributor' | 'admin';
  createdAt: Date;
}
