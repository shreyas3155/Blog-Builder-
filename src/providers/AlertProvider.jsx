'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// --- Context ---
const AlertContext = createContext(null);

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used inside <AlertProvider>');
  return ctx;
}

// --- Config per alert type ---
const TYPE_CONFIG = {
  success: {
    Icon: CheckCircle,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    ringColor: 'ring-emerald-500/20',
    barColor: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    btnColor: 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400',
    title: 'Success',
  },
  error: {
    Icon: XCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/15',
    ringColor: 'ring-red-500/20',
    barColor: 'bg-gradient-to-r from-red-600 to-rose-500',
    btnColor: 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400',
    title: 'Error',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15',
    ringColor: 'ring-amber-500/20',
    barColor: 'bg-gradient-to-r from-amber-500 to-orange-400',
    btnColor: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400',
    title: 'Warning',
  },
  info: {
    Icon: Info,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15',
    ringColor: 'ring-indigo-500/20',
    barColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    btnColor: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
    title: 'Notice',
  },
};

// --- Alert Popup Modal ---
function AlertPopup({ message, type = 'info', onClose }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const { Icon, iconColor, iconBg, ringColor, barColor, btnColor, title } = cfg;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className={`h-1 w-full ${barColor}`} />

        {/* Close icon (top-right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
          aria-label="Close"
          style={{ position: 'absolute' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Body */}
        <div className="flex flex-col items-center text-center gap-4 px-6 pt-8 pb-6">
          {/* Icon circle */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ring-4 ${iconBg} ${ringColor}`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>

          {/* Title */}
          <h3 className="font-heading font-extrabold text-lg text-foreground tracking-tight">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
            {message}
          </p>

          {/* OK Button */}
          <button
            onClick={onClose}
            className={`mt-2 w-full py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all ${btnColor}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Confirm Popup Modal ---
function ConfirmPopup({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-400" />

        {/* Body */}
        <div className="flex flex-col items-center text-center gap-4 px-6 pt-8 pb-6">
          {/* Icon circle */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center ring-4 bg-amber-500/15 ring-amber-500/20">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>

          {/* Title */}
          <h3 className="font-heading font-extrabold text-lg text-foreground tracking-tight">
            Are you sure?
          </h3>

          {/* Message */}
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-2 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 text-sm font-semibold bg-secondary/40 hover:bg-secondary/60 border border-border/50 text-foreground rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 text-sm font-bold bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-xl shadow-md transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Provider ---
export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);   // { message, type }
  const [confirm, setConfirm] = useState(null); // { message }
  const resolveRef = useRef(null);

  /** Show a popup alert modal */
  const showAlert = useCallback((message, type = 'info') => {
    setAlert({ message, type });
  }, []);

  /** Show a popup confirm modal, returns Promise<boolean> */
  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfirm({ message });
    });
  }, []);

  const closeAlert = useCallback(() => setAlert(null), []);

  const handleConfirm = () => {
    setConfirm(null);
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setConfirm(null);
    resolveRef.current?.(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Alert Popup */}
      {alert && (
        <AlertPopup
          message={alert.message}
          type={alert.type}
          onClose={closeAlert}
        />
      )}

      {/* Confirm Popup */}
      {confirm && (
        <ConfirmPopup
          message={confirm.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </AlertContext.Provider>
  );
}
