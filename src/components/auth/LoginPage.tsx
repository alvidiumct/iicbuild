import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Award,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Home,
  Server,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setPublicVerifyCertificateId, setActiveView, setIsVpsModalOpen } = useApp();

  const [email, setEmail] = useState('admin@diu.edu.bd');
  const [password, setPassword] = useState('admin#iic@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to authenticate. Please check your credentials.');
      }
      setIsSubmitting(false);
    }, 350);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-[#0e1d3c] to-slate-950 flex flex-col justify-between py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#214FA2]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

      {/* Top Bar with public verification link */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-400 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#214FA2] text-white flex items-center justify-center font-black text-xs shadow-md">
            IIC
          </div>
          <span className="font-semibold text-slate-200">Industrial Innovation Centre</span>
          <span className="hidden sm:inline text-slate-500">· Daffodil International University</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/30 transition-colors text-xs font-semibold"
          >
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <span>← Homepage & Showcase</span>
          </button>

          <button
            onClick={() => setIsVpsModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs"
          >
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>VPS Guide</span>
          </button>

          <button
            onClick={() => setPublicVerifyCertificateId('CERT-2026-001')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Verify Certificate</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 py-6">
        {/* Left Branding & Highlights Column */}
        <div className="lg:col-span-6 text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#214FA2]/30 border border-[#214FA2]/50 text-blue-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DIU Innovation Platform v2.4</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Student Ambassador & Admin Portal
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Empowering student innovators, verifying academic credentials, and coordinating multidisciplinary R&D initiatives at Daffodil International University.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-xs">
              <div className="text-lg font-bold text-white">R&D Labs</div>
              <div className="text-xs text-slate-400 font-medium">Applied Incubation</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-xs">
              <div className="text-lg font-bold text-emerald-400">Verified QR</div>
              <div className="text-xs text-slate-400 font-medium">Digital Credentials & CV</div>
            </div>
          </div>

          {/* Institutional Highlights */}
          <div className="pt-2 space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[#214FA2]" />
              <span>Ashulia Smart Campus Innovation Complex</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Multidisciplinary Engineering & Tech Prototyping</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Cryptographically Verified Ambassador Portfolios</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200/80">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your university email address and assigned password
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DIU Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@diu.edu.bd"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-[#214FA2] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Demo credentials reminder */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-3.5 h-3.5 rounded text-[#214FA2] border-slate-300 focus:ring-[#214FA2]"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                </label>

                <div className="text-[11px] text-slate-400">Default demo: iic@2026</div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#214FA2] hover:bg-[#1a3f85] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Hint Box for newly created ambassadors */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Provisioned Accounts</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                If an administrator created your ambassador account, use the email and password provided in your induction credentials or CSV export.
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="text-xs font-semibold text-slate-500 hover:text-[#214FA2] transition-colors inline-flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Public Homepage & Showcase</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#214FA2]" />
                <h3 className="font-bold text-sm text-slate-900">Password Recovery</h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {forgotSent ? (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4" /> Reset Email Dispatched!
                    </div>
                    <p>
                      Password recovery instructions and a secure one-time login link have been dispatched to <b>{forgotEmail}</b>.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSent(false);
                    }}
                    className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter the university email linked to your IIC account. We will send password reset instructions to your inbox.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      University Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="student@diu.edu.bd"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#214FA2] hover:bg-[#1a3f85] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Send Reset Instructions</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-4 border-t border-slate-800/60 z-10 gap-2">
        <div>
          © {new Date().getFullYear()} Industrial Innovation Centre (IIC) · Daffodil International University
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400">Campus: Ashulia, Dhaka</span>
          <span className="hover:text-slate-400">Privacy & Terms</span>
          <span className="hover:text-slate-400">Support: iic@diu.edu.bd</span>
        </div>
      </div>
    </div>
  );
};
