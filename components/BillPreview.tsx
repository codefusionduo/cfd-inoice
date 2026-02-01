import React from 'react';
import { ExtractedBillData } from '../types';
import { Printer, Scan } from 'lucide-react';

interface BillPreviewProps {
  data: ExtractedBillData;
  onReset: () => void;
}

export const BillPreview: React.FC<BillPreviewProps> = ({ data, onReset }) => {
  const handlePrint = () => {
    // Basic standard print command. 
    // Works in all modern browsers unless explicitly blocked by a sandbox.
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200 animate-fade-in print:shadow-none print:border-none">
      {/* Action Bar - Hidden during print */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center no-print print:hidden">
        <div className="flex items-center gap-2">
          <Scan size={18} className="text-indigo-400" />
          <span className="text-sm font-bold tracking-wider">CFD INVOICE VIEWER</span>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={handlePrint} 
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-400/30 hover:bg-indigo-500/20 text-indigo-100 rounded text-sm font-medium transition-all active:scale-95 cursor-pointer"
          >
            <Printer size={16} /> 
            <span>Print Bill</span>
          </button>
          <button 
            type="button"
            onClick={onReset} 
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
          >
            New Scan
          </button>
        </div>
      </div>

      {/* Bill Content */}
      <div className="p-8 md:p-12 print:p-4 bg-white">
        
        {/* Top Branding - This will appear on the printed bill */}
        <div className="flex items-center justify-between mb-10 border-b-4 border-indigo-600 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg print:shadow-none">
              <Scan className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">CFD Invoice</div>
              <div className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase mt-1">Intelligent Extraction</div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight leading-none">{data.documentType || 'INVOICE'}</h1>
            <p className="text-xs font-medium text-gray-400 mt-2 uppercase tracking-widest">Digital Copy</p>
          </div>
        </div>

        {/* Document Meta Info */}
        <div className="flex flex-col md:flex-row justify-between mb-10">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference Number</div>
            <div className="text-xl font-mono font-bold text-gray-800">{data.documentNumber || 'NOT SPECIFIED'}</div>
          </div>
          <div className="flex flex-col md:text-right mt-4 md:mt-0 gap-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issued Date</div>
            <div className="text-xl font-bold text-gray-800">{data.date || 'N/A'}</div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3 border-l-4 border-indigo-200 pl-3">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Sender / Consignor</h3>
            </div>
            <div className="font-bold text-xl text-gray-900 mb-1">{data.sender.name || 'Unknown Entity'}</div>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{data.sender.address}</div>
            {data.sender.taxId && (
              <div className="mt-3 text-xs bg-gray-100 w-fit px-2 py-1 rounded font-mono text-gray-600">
                <span className="font-bold">TAX ID:</span> {data.sender.taxId}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3 border-l-4 border-indigo-200 pl-3">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Receiver / Consignee</h3>
            </div>
            <div className="font-bold text-xl text-gray-900 mb-1">{data.receiver.name || 'Unknown Entity'}</div>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{data.receiver.address}</div>
            {data.receiver.taxId && (
              <div className="mt-3 text-xs bg-gray-100 w-fit px-2 py-1 rounded font-mono text-gray-600">
                <span className="font-bold">TAX ID:</span> {data.receiver.taxId}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-10 overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Qty</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Rate</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.items.length > 0 ? (
                data.items.map((item, index) => (
                  <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-gray-800">{item.description}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 text-right font-mono">{item.quantity}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 text-right font-mono">{item.rate}</td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-black text-right font-mono">{item.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 italic">No line items were detected.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="flex flex-col md:flex-row justify-between pt-8 border-t-2 border-gray-100">
          <div className="mb-8 md:mb-0 max-w-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Notes & Observations</h4>
            <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
              {data.notes || "No additional remarks were found in the scanned document."}
            </div>
          </div>
          
          <div className="w-full md:w-80">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
                <span className="font-mono text-sm">{data.currency} {data.subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Tax / Fees</span>
                <span className="font-mono text-sm">{data.currency} {data.taxAmount}</span>
              </div>
              <div className="pt-4 mt-2 border-t border-indigo-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono tracking-tighter">
                    {data.currency} {data.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer - Digital Signature */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="w-24 h-1 bg-indigo-100 rounded-full"></div>
          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
            Processed Digitally by <span className="text-indigo-600 opacity-60">CFD Invoice AI</span>
          </div>
          <p className="text-[9px] text-gray-300 font-medium">
            System ID: {Math.random().toString(36).substring(2, 10).toUpperCase()} • Timestamp: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-4 { padding: 1rem !important; }
          /* Ensure colors are printed */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};