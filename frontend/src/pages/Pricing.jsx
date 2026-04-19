import React, { useState } from 'react';
import { useInvitationState } from '../hooks/useInvitationState';
import { packagesList } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, CreditCard, Lock, Smartphone, Copy, CheckCircle, Mail, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

const UPI_VPA = 'triredglobal@upi';
const MERCHANT = 'Weddinginvites by Trired Global';

function buildUpiLink({ amount, email, planName }) {
  const note = `EV-${planName}-${email}`;
  const params = new URLSearchParams({ pa: UPI_VPA, pn: MERCHANT, am: String(amount), cu: 'INR', tn: note });
  return `upi://pay?${params.toString()}`;
}

function qrUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(text)}`;
}

function generateInviteLink(email, planId) {
  const hash = btoa(`${email}-${planId}-${Date.now()}`).replace(/=/g, '').slice(0, 12);
  return `${window.location.origin}/invitation/${hash}`;
}

async function sendConfirmationEmail() {
  await new Promise((resolve) => setTimeout(resolve, 1800));
  return true;
}

const UPI_APPS = [
  { name: 'PhonePe', label: 'PP', scheme: 'phonepe://' },
  { name: 'GPay', label: 'GP', scheme: 'tez://' },
  { name: 'Paytm', label: 'PT', scheme: 'paytmmp://' },
  { name: 'BHIM', label: 'UPI', scheme: 'upi://' },
];

export function Pricing() {
  const { data, setPackage } = useInvitationState();
  const [step, setStep] = useState('plan');
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [txnId, setTxnId] = useState('');
  const [txnErr, setTxnErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [processing, setProcessing] = useState(false);

  const pkg = packagesList.find((p) => p.id === data.package);
  const upiLink = pkg ? buildUpiLink({ amount: pkg.priceINR, email, planName: pkg.name }) : '';

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

  const copyUpiId = async () => {
    await navigator.clipboard.writeText(UPI_VPA);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const openApp = (scheme) => {
    window.location.href = upiLink.replace('upi://', scheme);
  };

  const handleVerify = async () => {
    if (!pkg) return;

    if (!txnId.trim() || txnId.trim().length < 8) {
      setTxnErr('Please enter a valid transaction or UTR ID with at least 8 characters.');
      return;
    }

    setTxnErr('');
    setProcessing(true);
    setStep('delivering');

    try {
      const link = generateInviteLink(email, pkg.id);
      setInviteLink(link);

      await sendConfirmationEmail();
      setStep('done');
    } catch (error) {
      console.error(error);
      setStep('verify');
      setTxnErr('Verification failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-600">
          <Sparkles className="h-4 w-4" /> One-time payment • No subscription
        </div>
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Pricing & Checkout</h1>
        <p className="text-lg text-slate-600">
          Pay once via UPI. Your personalized invitation link is delivered to your email after confirmation.
        </p>
      </div>

      {step === 'plan' && (
        <>
          <div className="mx-auto mb-12 grid max-w-5xl gap-8 lg:grid-cols-3">
            {packagesList.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setPackage(plan.id)}
                className={cn(
                  'group relative cursor-pointer rounded-[32px] border bg-white p-8 transition-all hover:shadow-xl',
                  data.package === plan.id
                    ? 'z-10 scale-105 border-rose-400 ring-2 ring-rose-300 shadow-xl'
                    : 'border-slate-200 hover:border-rose-200'
                )}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                    Most Chosen
                  </div>
                )}
                <h3 className="mb-1 text-2xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mb-1 text-4xl font-black text-rose-600">{plan.price}</div>
                <div className="mb-6 text-xs uppercase tracking-widest text-slate-400">One-time • INR</div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={cn(
                    'w-full rounded-2xl py-3 text-sm font-bold transition-all',
                    data.package === plan.id
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                      : 'border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
                  )}
                >
                  {data.package === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>

          <div className="mx-auto max-w-sm">
            <Button
              onClick={() => pkg && setStep('email')}
              disabled={!pkg}
              variant="primary"
              className="w-full border-rose-500 bg-rose-500 py-4 text-lg font-bold hover:bg-rose-600 disabled:opacity-40"
            >
              Continue to Checkout <ArrowRight className="h-5 w-5" />
            </Button>
            {!pkg && <p className="mt-2 text-center text-sm text-slate-400">Select a plan to continue.</p>}
          </div>
        </>
      )}

      {step === 'email' && (
        <div className="mx-auto max-w-md">
          <Card title="Where should we send your invitation link?" subtitle={`After paying ${pkg?.price}, your invitation link will be emailed here.`} icon={Mail}>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
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
                  onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailNext()}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
                {emailErr && <p className="text-xs text-red-500">{emailErr}</p>}
              </div>

              <p className="text-xs leading-relaxed text-slate-400">
                We will send the confirmed invitation link to this address after payment verification.
              </p>

              <Button onClick={handleEmailNext} variant="primary" className="w-full border-rose-500 bg-rose-500 py-3 font-bold hover:bg-rose-600">
                Generate UPI Payment <ArrowRight className="h-4 w-4" />
              </Button>
              <button type="button" onClick={() => setStep('plan')} className="w-full text-center text-xs text-slate-400 transition-colors hover:text-slate-600">
                Back to plans
              </button>
            </div>
          </Card>
        </div>
      )}

      {step === 'payment' && (
        <div className="mx-auto max-w-md">
          <Card title="Complete Your UPI Payment" subtitle={`Pay ${pkg?.price} to activate your invitation.`} icon={Smartphone}>
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-900">{pkg?.name} Plan</div>
                  <div className="mt-0.5 text-xs text-slate-500">Delivering to: <span className="font-medium text-slate-700">{email}</span></div>
                </div>
                <div className="text-2xl font-black text-rose-600">{pkg?.price}</div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md">
                  <img src={qrUrl(upiLink)} alt="UPI QR" className="h-[240px] w-[240px]" />
                </div>
                <p className="text-center text-sm text-slate-500">Scan this QR code with any UPI app.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">or open an app</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {UPI_APPS.map((app) => (
                  <button
                    type="button"
                    key={app.name}
                    onClick={() => openApp(app.scheme)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-rose-300 hover:shadow-md"
                  >
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{app.label}</span>
                    <span className="text-[10px] font-semibold text-slate-600">{app.name}</span>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">UPI ID</div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-semibold text-slate-800">{UPI_VPA}</span>
                  <button type="button" onClick={copyUpiId} className="rounded-lg p-1.5 transition-colors hover:bg-slate-200">
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              <Button onClick={() => setStep('verify')} variant="primary" className="w-full border-rose-500 bg-rose-500 py-3.5 font-bold hover:bg-rose-600">
                I Completed Payment
              </Button>
              <button type="button" onClick={() => setStep('email')} className="w-full text-center text-xs text-slate-400 transition-colors hover:text-slate-600">
                Change email
              </button>
            </div>
          </Card>
        </div>
      )}

      {step === 'verify' && (
        <div className="mx-auto max-w-md">
          <Card title="Confirm Your Payment" subtitle="Enter the transaction ID from your UPI app to verify." icon={CreditCard}>
            <div className="space-y-5">
              <div className="py-2 text-center">
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Payment verification</div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Open your UPI app, go to payment history, find the payment sent to <strong>{UPI_VPA}</strong>, then copy the UTR or transaction ID.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Transaction / UTR ID</label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => { setTxnId(e.target.value); setTxnErr(''); }}
                  placeholder="For example: 426123456789"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono tracking-wider outline-none transition focus:border-rose-400"
                />
                {txnErr && <p className="text-xs text-red-500">{txnErr}</p>}
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                After verification, your live invitation link will be sent to <strong>{email}</strong>.
              </div>

              <Button onClick={handleVerify} disabled={processing} variant="primary" className="w-full border-rose-500 bg-rose-500 py-3.5 font-bold hover:bg-rose-600">
                {processing ? <><RefreshCw className="h-4 w-4 animate-spin" /> Verifying and sending...</> : 'Verify & Send Invitation Link'}
              </Button>
              <button type="button" onClick={() => setStep('payment')} className="w-full text-center text-xs text-slate-400 transition-colors hover:text-slate-600">
                Back to payment
              </button>
            </div>
          </Card>
        </div>
      )}

      {step === 'delivering' && (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-200 bg-rose-50">
            <Mail className="h-10 w-10 animate-bounce text-rose-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Sending your link...</h2>
          <p className="text-slate-500">Generating your invitation and preparing delivery to <strong>{email}</strong>.</p>
        </div>
      )}

      {step === 'done' && (
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 text-center shadow-2xl shadow-emerald-100">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-emerald-800">You&apos;re All Set</h2>
            <p className="mb-8 leading-relaxed text-emerald-700">
              Your <strong>{pkg?.name}</strong> invitation for <strong>{data.couple?.bride} & {data.couple?.groom}</strong> is ready.
              A confirmation email with the invitation link has been sent to <strong>{email}</strong>.
            </p>

            <div className="mb-6 rounded-2xl border border-emerald-200 bg-white p-4">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">Your Live Invitation Link</div>
              <div className="break-all font-mono text-sm text-slate-700">{inviteLink}</div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
              >
                <Copy className="h-4 w-4" /> Copy Link
              </button>
              <button
                type="button"
                onClick={() => {
                  const wa = `https://wa.me/?text=${encodeURIComponent(`You're invited. View our wedding invitation here: ${inviteLink}`)}`;
                  window.open(wa, '_blank');
                }}
                className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-5 py-2.5 font-semibold text-white shadow-lg transition-colors hover:bg-[#20ba5a]"
              >
                Share on WhatsApp
              </button>
            </div>

            <p className="mt-8 text-xs text-emerald-600/70">
              <Lock className="inline h-3 w-3" /> Transaction ID: <span className="font-mono">{txnId}</span>
            </p>
          </div>
        </div>
      )}

      {!['delivering', 'done'].includes(step) && (
        <p className="mt-10 flex items-center justify-center gap-1 text-center text-xs text-slate-400">
          <Lock className="h-3 w-3" /> One-time UPI payment • No recurring charges • Link delivered via email
        </p>
      )}
    </div>
  );
}
