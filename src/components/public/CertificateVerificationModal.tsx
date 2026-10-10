import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  Printer,
  X,
  ExternalLink,
} from 'lucide-react';

export const CertificateVerificationModal: React.FC = () => {
  const { publicVerifyCertificateId, setPublicVerifyCertificateId, certificates, ambassadors } =
    useApp();

  const [copied, setCopied] = useState(false);

  if (!publicVerifyCertificateId) return null;

  const certificate = certificates.find((c) => c.certificateId === publicVerifyCertificateId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}?verify=${publicVerifyCertificateId}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Verification Status Banner */}
        <div className="bg-emerald-600 px-6 py-3 text-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>Official Verified Academic Credential · Industrial Innovation Centre</span>
          </div>
          <button
            onClick={() => setPublicVerifyCertificateId(null)}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-emerald-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {certificate ? (
          <div className="p-8 sm:p-10 space-y-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Certificate Border Enclosure */}
            <div className="border-4 border-double border-slate-300 p-8 rounded-xl bg-white/95 text-center space-y-6 relative shadow-inner">
              {/* Seal */}
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
                <Award className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
                  Daffodil International University
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#214FA2] mt-0.5">
                  Industrial Innovation Centre (IIC)
                </h2>
              </div>

              <div className="py-2">
                <p className="text-xs text-slate-500 italic">This is to officially certify that</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-serif">
                  {certificate.ambassadorName}
                </h1>
                <p className="text-xs font-mono text-slate-600 mt-1">
                  Recipient ID: {certificate.ambassadorId}
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-bold text-base text-slate-800">{certificate.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{certificate.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div className="text-left space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Verified Contribution
                  </span>
                  <strong className="text-slate-900 font-mono">
                    {certificate.contributionHours} Hours Logged
                  </strong>
                  <div className="text-[10px] text-slate-400">Date: {certificate.issueDate}</div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Director of Innovation
                  </span>
                  <strong className="text-slate-900">{certificate.signatoryName}</strong>
                  <div className="text-[10px] text-slate-400">{certificate.signatoryTitle}</div>
                </div>
              </div>

              {/* Cryptographic verification strip */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                <span>Unique ID: {certificate.certificateId}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Authenticity Cryptographically Validated
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied' : 'Copy Verification URL'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>

                <button
                  onClick={() => setPublicVerifyCertificateId(null)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            No certificate found matching ID: <strong>{publicVerifyCertificateId}</strong>.
          </div>
        )}
      </div>
    </div>
  );
};
