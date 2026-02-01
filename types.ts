export interface LineItem {
  description: string;
  quantity: string;
  rate: string;
  amount: string;
}

export interface ExtractedBillData {
  documentType: string;
  documentNumber: string;
  date: string;
  sender: {
    name: string;
    address: string;
    taxId?: string;
  };
  receiver: {
    name: string;
    address: string;
    taxId?: string;
  };
  items: LineItem[];
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  currency: string;
  notes?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: ExtractedBillData;
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  HISTORY = 'HISTORY'
}