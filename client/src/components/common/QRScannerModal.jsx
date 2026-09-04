import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Modal } from './Modal';
import { Camera, QrCode, AlertCircle, CheckCircle, Sparkles, BookOpen, User } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose, onScanSuccess, mode = 'both', title = 'QR Code Scanner' }) => {
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [activeTab, setActiveTab] = useState('camera'); // camera | test
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrcodeScanner = null;

    if (isOpen && activeTab === 'camera') {
      try {
        html5QrcodeScanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
          },
          false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            handleDecodedText(decodedText);
          },
          (errorMessage) => {
            // Ignore ongoing frame search errors
          }
        );

        scannerRef.current = html5QrcodeScanner;
      } catch (err) {
        setCameraError("Camera access unavailable or permission denied. You can use the Quick Test Simulator.");
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.warn("Scanner cleanup:", e));
      }
    };
  }, [isOpen, activeTab]);

  const handleDecodedText = (text) => {
    try {
      // Parse JSON payload if available, else raw string
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }

      setScanResult({ raw: text, parsed });
      if (onScanSuccess) {
        onScanSuccess(parsed, text);
      }
    } catch (e) {
      console.error("Scan processing error:", e);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleDecodedText(manualInput.trim());
    setManualInput('');
  };

  // Quick Preset Samples for 1-click test scanning
  const samplePresets = [
    {
      label: "Clean Code (Book)",
      payload: JSON.stringify({ type: 'book', id: 'book_1', isbn: '978-0132350884', title: 'Clean Code' })
    },
    {
      label: "Algorithms CLRS (Book)",
      payload: JSON.stringify({ type: 'book', id: 'book_2', isbn: '978-0262033848', title: 'Introduction to Algorithms' })
    },
    {
      label: "Aarav Sharma (Student)",
      payload: JSON.stringify({ type: 'student', id: 'usr_student_1', roll: '21CS1084', name: 'Aarav Sharma' })
    },
    {
      label: "Priya Patel (Student)",
      payload: JSON.stringify({ type: 'student', id: 'usr_student_2', roll: '22AI1042', name: 'Priya Patel' })
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Point camera at physical QR code or use quick simulator"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Mode Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'camera'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            Live Camera Scan
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'test'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            1-Click Simulator
          </button>
        </div>

        {activeTab === 'camera' ? (
          <div>
            {cameraError && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-xl text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
            <div id="qr-reader" className="w-full bg-slate-900 text-white rounded-xl overflow-hidden min-h-[260px] flex items-center justify-center"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any quick-scan preset to instantly simulate physical barcode / QR code reader hardware:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDecodedText(preset.payload)}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-xs font-medium flex items-center justify-between group"
                >
                  <span className="text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {preset.label}
                  </span>
                  <QrCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                </button>
              ))}
            </div>

            <form onSubmit={handleManualSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Or Paste Custom ISBN / Student Roll Number / JSON:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 978-0132350884 or 21CS1084"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  Simulate Scan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scan Result Feedback */}
        {scanResult && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-start gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <h5 className="font-bold text-emerald-900 dark:text-emerald-200">
                Scan Detected Successfully!
              </h5>
              <p className="text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono break-all">
                {scanResult.parsed.title || scanResult.parsed.name || scanResult.raw}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
