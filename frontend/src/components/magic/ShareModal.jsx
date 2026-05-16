import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, MessageSquare, Download } from 'lucide-react';

export function ShareModal({ shareUrl, onClose }) {
  const [copied, setCopied] = useState(false);
  const [msgCopied, setMsgCopied] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&color=111111&bgcolor=ffffff&margin=10`;

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappShare = () => {
    const msg = `You're invited! 🌹\nView our wedding invitation:\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyWhatsappMsg = async () => {
    const bride = shareUrl.split('/').pop()?.split('-')[0] || 'Us';
    const msg = `You're invited! 🌹\nView our wedding invitation:\n${shareUrl}`;
    await navigator.clipboard.writeText(msg);
    setMsgCopied(true);
    setTimeout(() => setMsgCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-[420px] rounded-t-[28px] sm:rounded-[28px] bg-white shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Golden header */}
        <div className="relative bg-gradient-to-br from-[#D4A76A] to-[#8B6914] px-8 pt-10 pb-14 text-center text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <div className="text-[42px] mb-2">🎉</div>
          <h2 className="text-xl font-bold font-serif">Your invitation is live!</h2>
          <p className="mt-1.5 text-white/75 text-[13px]">Share with your loved ones</p>
        </div>

        {/* Cards */}
        <div className="px-5 pb-6 -mt-6 space-y-3">
          {/* Link */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-md p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-2">Invitation Link</p>
            <p className="text-[12px] text-gray-700 break-all font-mono mb-3 leading-relaxed">{shareUrl}</p>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-[#111] text-white hover:bg-black'
                }`}
              >
                {copied ? <><Check className="h-3.5 w-3.5" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy Link</>}
              </button>
              <button
                onClick={() => window.open(shareUrl, '_blank')}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* WhatsApp */}
          <button
            onClick={whatsappShare}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-3.5 text-white font-bold text-[13px] hover:bg-[#1DA851] transition-colors active:scale-[0.98]"
          >
            <MessageSquare className="h-5 w-5" />
            Send via WhatsApp
          </button>

          {/* QR Code */}
          <div className="rounded-2xl border border-gray-100 p-5 text-center bg-gray-50/50">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">QR Code</p>
            <div className="flex justify-center">
              <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm inline-block">
                <img src={qrUrl} alt="QR Code" className="w-[120px] h-[120px] rounded-lg" loading="lazy" />
              </div>
            </div>
            <a
              href={qrUrl}
              download="wedding-invitation-qr.png"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider transition-colors"
            >
              <Download className="h-3 w-3" /> Download QR
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
