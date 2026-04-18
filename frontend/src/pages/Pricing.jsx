import React, { useState } from 'react';
import { useInvitationState } from '../hooks/useInvitationState';
import { packagesList } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, CreditCard, Lock, Smartphone, Copy, CheckCircle, Mail, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

/* ── Merchant Config ──────────────────────────────────────────────
   Replace with your actual UPI VPA and merchant name.            */
const UPI_VPA  = 'triredglobal@upi';
const MERCHANT = 'Ethereal Vows by Trired Global';

/* ── Helpers ─────────────────────────────────────────────────── */
function buildUpiLink({ amount, email, planName }) {
  const note = `EV-${planName}-${email}`;
  const p = new URLSearchParams({ pa: UPI_VPA, pn: MERCHANT, am: String(amount), cu: 'INR', tn: note });
  return `upi://pay?${p.toString()}`;
}

function qrUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(text)}`;
}

/* Generate a mock shareable invitation link */
function generateInviteLink(email, planId) {
  const hash = btoa(`${email}-${planId}-${Date.now()}`).replace(/=/g, '').slice(0, 12);
  return `${window.location.origin}/invitation/${hash}`;
}

/* Send email via EmailJS (free tier – replace with your keys) */
async function sendConfirmationEmail({ toEmail, inviteLink, planName, brideName, groomName }) {
  /* 
    To enable real email sending:
    1. Sign up at https://emailjs.com (free)
    2. Create a service, template, and get your public key
    3. Replace the constants below
    4. Install: npm install @emailjs/browser
    5. Uncomment the emailjs.send() call below

    import emailjs from '@emailjs/browser';

    const EMAILJS_SERVICE_ID  = 'your_service_id';
    const EMAILJS_TEMPLATE_ID = 'your_template_id';
    const EMAILJS_PUBLIC_KEY  = 'your_public_key';

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email:    toEmail,
      invite_link: inviteLink,
      plan_name:   planName,
      bride_name:  brideName,
      groom_name:  groomName,
    }, EMAILJS_PUBLIC_KEY);
  */

  // Simulate network delay for now
  await new Promise(r => setTimeout(r, 1800));
  return true;
}

const UPI_APPS = [
  { name: 'PhonePe', emoji: '📱', scheme: 'phonepe://' },
  { name: 'GPay',    emoji: '💳', scheme: 'tez://'     },
  { name: 'Paytm',   emoji: '🪙', scheme: 'paytmmp://' },
  { name: 'BHIM',    emoji: '🏦', scheme: 'upi://'     },
];

/* ── Flow Steps ───────────────────────────────────────────────── */
//  plan → email → payment → verify → delivering → done

export function Pricing() {
  const { data, setPackage } = useInvitationState();
  const [step, setStep]       = useState('plan');       // plan | email | payment | verify | delivering | done
  const [email, setEmail]     = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [txnId, setTxnId]     = useState('');
  const [txnErr, setTxnErr]   = useState('');
  const [copied, setCopied]   = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [processing, setProcessing] = useState(false);

  const pkg = packagesList.find(p => p.id === data.package);
  const upiLink = pkg ? buildUpiLink({ amount: pkg.priceINR, email, planName: pkg.name }) : '';

  /* ── Handlers ─────────────────────────────────────────────── */
  const validateEmail = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Please enter a valid email address.');
      return false;
    }
    setEmailErr('');
    return true;
  };

  const handleEmailNext = () => {
    if (!pkg) return;
    if (!validateEmail()) return;
    setStep('payment');
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_VPA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openApp = (scheme) => {
    window.location.href = upiLink.replace('upi://', scheme);
  };

  const handleVerify = async () => {
    if (!txnId.trim() || txnId.trim().length < 8) {
      setTxnErr('Please enter a valid Transaction / UTR ID (at least 8 characters).');
      return;
    }
    setTxnErr('');
    setProcessing(true);
    setStep('delivering');

    try {
      const link = generateInviteLink(email, pkg.id);
      setInviteLink(link);

      await sendConfirmationEmail({
        toEmail:   email,
        inviteLink: link,
        planName:  pkg.name,
        brideName: data.couple?.bride || 'Bride',
        groomName: data.couple?.groom || 'Groom',
      });

      setStep('done');
    } catch (e) {
      console.error(e);
      setStep('verify');
      setTxnErr('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="container mx-auto px-4 py-16">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5 text-rose-600 text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" /> One-time payment · No subscription
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Pricing & Checkout</h1>
        <p className="text-lg text-slate-600">
          Pay once via UPI. Your personalized live invitation link is delivered straight to your inbox.
        </p>
      </div>

      {/* ── Step: Plan Selection ── */}
      {step === 'plan' && (
        <>
          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto mb-12">
            {packagesList.map((p) => (
              <div
                key={p.id}
                onClick={() => setPackage(p.id)}
                className={cn(
                  'relative cursor-pointer rounded-[32px] border bg-white p-8 transition-all hover:shadow-xl group',
                  data.package === p.id
                    ? 'border-rose-400 ring-2 ring-rose-300 shadow-xl scale-105 z-10'
                    : 'border-slate-200 hover:border-rose-200'
                )}
              >
                {p.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                    Most Chosen
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{p.name}</h3>
                <div className="text-4xl font-black text-rose-600 mb-1">{p.price}</div>
                <div className="text-xs text-slate-400 mb-6 uppercase tracking-widest">One-time · INR</div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(feat => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{feat}
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  'w-full py-3 rounded-2xl font-bold transition-all text-sm',
                  data.package === p.id
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                    : 'border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
                )}>
                  {data.package === p.id ? '✓ Selected' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>

          <div className="max-w-sm mx-auto">
            <Button
              onClick={() => pkg && setStep('email')}
              disabled={!pkg}
              variant="primary"
              className="w-full py-4 text-lg font-bold bg-rose-500 border-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-200 disabled:opacity-40"
            >
              Continue to Checkout <ArrowRight className="w-5 h-5" />
            </Button>
            {!pkg && <p className="text-center text-sm text-slate-400 mt-2">Select a plan to continue</p>}
          </div>
        </>
      )}

      {/* ── Step: Email ── */}
      {step === 'email' && (
        <div className="max-w-md mx-auto">
          <Card title="Where should we send your invitation link?" subtitle={`After paying ${pkg?.price}, your live invitation link will be emailed instantly.`} icon={Mail}>
            <div className="space-y-4">
              {/* Selected plan summary */}
              <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-900">{pkg?.name} Plan</div>
                  <div className="text-xs text-slate-500">One-time payment</div>
                </div>
                <div className="text-2xl font-black text-rose-600">{pkg?.price}</div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Your Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleEmailNext()}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
                {emailErr && <p className="text-red-500 text-xs">{emailErr}</p>}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                📧 We'll send your unique live invitation link to this address once payment is confirmed. No spam ever.
              </p>

              <Button
                onClick={handleEmailNext}
                variant="primary"
                className="w-full py-3 bg-rose-500 border-rose-500 hover:bg-rose-600 font-bold"
              >
                Generate UPI Payment <ArrowRight className="w-4 h-4" />
              </Button>
              <button onClick={() => setStep('plan')} className="w-full text-xs text-slate-400 hover:text-slate-600 text-center transition-colors">
                ← Back to plans
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Step: Payment ── */}
      {step === 'payment' && (
        <div className="max-w-md mx-auto">
          <Card title="Complete Your UPI Payment" subtitle={`Pay ${pkg?.price} to activate your invitation`} icon={Smartphone}>
            <div className="space-y-6">
              {/* Amount + email confirmation */}
              <div className="flex items-center justify-between bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-900">{pkg?.name} Plan</div>
                  <div className="text-xs text-slate-500 mt-0.5">Sending link to: <span className="font-medium text-slate-700">{email}</span></div>
                </div>
                <div className="text-2xl font-black text-rose-600">{pkg?.price}</div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-2xl border border-slate-200 bg-white shadow-md">
                  <img src={qrUrl(upiLink)} alt="UPI QR" className="w-[240px] h-[240px]" />
                </div>
                <p className="text-sm text-slate-500 text-center">Scan with any UPI app to pay</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">or tap to open app</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* App Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {UPI_APPS.map(app => (
                  <button
                    key={app.name}
                    onClick={() => openApp(app.scheme)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 hover:border-rose-300 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl">{app.emoji}</span>
                    <span className="text-[10px] font-semibold text-slate-600">{app.name}</span>
                  </button>
                ))}
              </div>

              {/* UPI ID copy */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">UPI ID</div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-semibold text-slate-800">{UPI_VPA}</span>
                  <button onClick={copyUpiId} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={() => setStep('verify')}
                variant="primary"
                className="w-full py-3.5 bg-rose-500 border-rose-500 hover:bg-rose-600 font-bold"
              >
                I've Completed Payment ✓
              </Button>
              <button onClick={() => setStep('email')} className="w-full text-xs text-slate-400 hover:text-slate-600 text-center transition-colors">
                ← Change email
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Step: Verify ── */}
      {step === 'verify' && (
        <div className="max-w-md mx-auto">
          <Card title="Confirm Your Payment" subtitle="Enter the transaction ID from your UPI app to verify." icon={CreditCard}>
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="text-5xl mb-3">🧾</div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Open your UPI app → go to <strong>Payment History</strong> → find payment to <strong>{UPI_VPA}</strong> → copy the UTR or Transaction ID.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Transaction / UTR ID</label>
                <input
                  type="text"
                  value={txnId}
                  onChange={e => { setTxnId(e.target.value); setTxnErr(''); }}
                  placeholder="e.g. 426123456789"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 font-mono tracking-wider"
                />
                {txnErr && <p className="text-red-500 text-xs">{txnErr}</p>}
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
                📧 On verification, your live invitation link will be sent to <strong>{email}</strong>
              </div>

              <Button
                onClick={handleVerify}
                disabled={processing}
                variant="primary"
                className="w-full py-3.5 bg-rose-500 border-rose-500 hover:bg-rose-600 font-bold"
              >
                {processing
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying & Sending…</>
                  : 'Verify & Send My Invitation Link →'
                }
              </Button>
              <button onClick={() => setStep('payment')} className="w-full text-xs text-slate-400 hover:text-slate-600 text-center transition-colors">
                ← Back to payment
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Step: Delivering ── */}
      {step === 'delivering' && (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 mb-6">
            <Mail className="w-10 h-10 text-rose-500 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sending your link…</h2>
          <p className="text-slate-500">Generating your personalized invitation and sending it to <strong>{email}</strong></p>
        </div>
      )}

      {/* ── Step: Done ── */}
      {step === 'done' && (
        <div className="max-w-lg mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-10 text-center shadow-2xl shadow-emerald-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-emerald-800 mb-2">You're All Set! 🎉</h2>
            <p className="text-emerald-700 mb-8 leading-relaxed">
              Your <strong>{pkg?.name}</strong> invitation for <strong>{data.couple?.bride} & {data.couple?.groom}</strong> is live.<br/><br/>
              A confirmation email with your invitation link has been sent to <strong>{email}</strong>.
            </p>

            {/* Invite link preview */}
            <div className="rounded-2xl bg-white border border-emerald-200 p-4 mb-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Your Live Invitation Link</div>
              <div className="font-mono text-sm text-slate-700 break-all">{inviteLink}</div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-2xl transition-colors shadow-lg"
              >
                <Copy className="w-4 h-4" /> Copy Link
              </button>
              <button
                onClick={() => {
                  const wa = `https://wa.me/?text=${encodeURIComponent(`You're invited! 💍 View our wedding invitation: ${inviteLink}`)}`;
                  window.open(wa, '_blank');
                }}
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold px-5 py-2.5 rounded-2xl transition-colors shadow-lg"
              >
                Share on WhatsApp
              </button>
            </div>

            <p className="text-xs text-emerald-600/70 mt-8">
              <Lock className="w-3 h-3 inline" /> Transaction ID: <span className="font-mono">{txnId}</span>
            </p>
          </div>
        </div>
      )}

      {/* Footer lock note */}
      {!['delivering', 'done'].includes(step) && (
        <p className="text-center text-xs text-slate-400 mt-10 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> One-time UPI payment · No recurring charges · Link delivered via email
        </p>
      )}
    </div>
  );
}
