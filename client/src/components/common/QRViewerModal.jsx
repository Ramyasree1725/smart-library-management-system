import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { Printer, Download, Copy, CheckCircle2, QrCode } from 'lucide-react';
import { useState } from 'react';

export const QRViewerModal = ({ isOpen, onClose, data, type = 'book' }) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  if (!data) return null;

  // Generate standardized JSON payload for machine reading
  const qrPayload = type === 'book'
    ? JSON.stringify({
        type: 'book',
        id: data._id,
        isbn: data.isbn,
        title: data.title,
        shelf: data.shelfLocation
      })
    : JSON.stringify({
        type: 'student',
        id: data._id,
        roll: data.rollNumber,
        name: data.name,
        dept: data.department
      });

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'book' ? "Book QR Code & Shelf Label" : "Student Digital Library Pass"}
      subtitle={type === 'book' ? `ISBN: ${data.isbn}` : `Roll No: ${data.rollNumber}`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center">
        {/* Printable Card Area */}
        <div 
          id="printable-qr-section"
          className="w-full bg-white text-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-2xl flex flex-col items-center shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              SL
            </div>
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Smart Library University Pass
            </span>
          </div>

          {/* QR Canvas SVG */}
          <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-100 flex items-center justify-center my-2">
            <QRCodeSVG
              value={qrPayload}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          <h4 className="font-bold text-base mt-2 text-slate-900 line-clamp-1">
            {type === 'book' ? data.title : data.name}
          </h4>

          <p className="text-xs text-slate-600 font-medium mt-0.5">
            {type === 'book' ? `Author: ${data.author}` : `${data.department} • ${data.rollNumber}`}
          </p>

          {type === 'book' && data.shelfLocation && (
            <div className="mt-2.5 inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
              📍 Location: {data.shelfLocation}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 w-full mt-6">
          <button
            onClick={handleCopyPayload}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Payload</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
          Scan this QR code with the circulation desk scanner to instantly process issue or return.
        </p>
      </div>
    </Modal>
  );
};
