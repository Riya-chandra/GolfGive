'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Charity } from '@/types';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'monthly';

  const [step, setStep] = useState(1);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    charityId: '',
    contributionPct: 10,
    plan: initialPlan,
  });

  useEffect(() => {
    fetch('/api/charities')
      .then((r) => r.json())
      .then((d) => setCharities(d.charities || []));
  }, []);

  const handleAccountStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setStep(2);
  };

  const handleFinalSubmit = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, fullName: form.fullName, charityId: form.charityId || null, contributionPct: form.contributionPct }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }

      const subRes = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: form.plan }),
      });
      const subData = await subRes.json();
      if (subData.url) { window.location.href = subData.url; }
      else { router.push('/dashboard'); router.refresh(); }
    } catch { setError('Something went wrong. Please try again.'); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-forest-900 font-bold">G</span>
          </div>
          <span className="font-display font-bold text-xl text-white">GolfGive</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-black text-white leading-tight mb-6">Join the golfers<br />making a difference.</h2>
          <div className="space-y-4">
            {[['⛳','Track your last 5 Stableford scores'],['🎯','Enter monthly prize draws automatically'],['❤️','10%+ of your sub goes to charity'],['🏆','Win real prizes. Real money.']].map(([icon,text]) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-forest-200 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {[1,2,3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-amber-500 text-forest-900' : 'bg-white/20 text-white/50'}`}>{s}</div>
              {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-amber-400' : 'bg-white/20'}`} />}
            </div>
          ))}
          <span className="text-white/60 text-xs ml-2">{step===1?'Account details':step===2?'Choose charity':'Pick your plan'}</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center"><span className="text-white font-bold text-sm">G</span></div>
              <span className="font-display font-bold text-xl text-charcoal">GolfGive</span>
            </Link>
            <div className="flex gap-1">{[1,2,3].map(s=><div key={s} className={`w-2 h-2 rounded-full ${step>=s?'bg-forest-600':'bg-gray-200'}`}/>)}</div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <>
              <h1 className="font-display text-3xl font-bold text-charcoal mb-2">Create your account</h1>
              <p className="text-gray-500 text-sm mb-8">Already have an account? <Link href="/auth/login" className="text-forest-600 font-medium hover:underline">Log in</Link></p>
              <form onSubmit={handleAccountStep} className="space-y-4">
                <div><label className="label">Full name</label><input type="text" className="input-field" placeholder="John Smith" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} required /></div>
                <div><label className="label">Email address</label><input type="email" className="input-field" placeholder="john@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
                <div><label className="label">Password</label><input type="password" className="input-field" placeholder="Min. 8 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8} /></div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className="btn-primary w-full justify-center py-3.5">Continue →</button>
              </form>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h1 className="font-display text-3xl font-bold text-charcoal mb-2">Choose your charity</h1>
              <p className="text-gray-500 text-sm mb-6">At least 10% of your subscription will support your chosen cause.</p>
              <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
                {charities.map((charity) => (
                  <label key={charity.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.charityId===charity.id?'border-forest-600 bg-forest-50':'border-gray-200 hover:border-forest-300'}`}>
                    <input type="radio" name="charity" value={charity.id} checked={form.charityId===charity.id} onChange={()=>setForm({...form,charityId:charity.id})} className="mt-0.5 accent-forest-600" />
                    <div><div className="font-semibold text-sm text-charcoal">{charity.name}</div><div className="text-xs text-gray-500 mt-0.5">{charity.short_description}</div></div>
                  </label>
                ))}
              </div>
              <div className="card p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Charity contribution</label>
                  <span className="text-forest-700 font-bold text-lg">{form.contributionPct}%</span>
                </div>
                <input type="range" min={10} max={100} step={5} value={form.contributionPct} onChange={e=>setForm({...form,contributionPct:parseInt(e.target.value)})} className="w-full accent-forest-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Minimum 10%</span><span>100%</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="btn-outline flex-1 justify-center">← Back</button>
                <button onClick={()=>setStep(3)} className="btn-primary flex-1 justify-center">Continue →</button>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <h1 className="font-display text-3xl font-bold text-charcoal mb-2">Choose your plan</h1>
              <p className="text-gray-500 text-sm mb-8">Secure checkout powered by Stripe. Cancel any time.</p>
              <div className="space-y-4 mb-6">
                {[
                  {id:'monthly',label:'Monthly',price:'£9.99',per:'/month',desc:"Billed monthly, cancel anytime"},
                  {id:'yearly',label:'Annual',price:'£99.99',per:'/year',desc:"Save 17% — that's £8.33/month",badge:'Best Value'},
                ].map((plan)=>(
                  <label key={plan.id} className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${form.plan===plan.id?'border-forest-600 bg-forest-50':'border-gray-200 hover:border-forest-300'}`}>
                    {plan.badge && <span className="absolute -top-2.5 right-4 bg-amber-500 text-gray-900 text-xs font-bold px-3 py-0.5 rounded-full">{plan.badge}</span>}
                    <div className="flex items-center gap-3">
                      <input type="radio" name="plan" value={plan.id} checked={form.plan===plan.id} onChange={()=>setForm({...form,plan:plan.id})} className="accent-forest-600" />
                      <div><div className="font-semibold text-charcoal">{plan.label}</div><div className="text-xs text-gray-500">{plan.desc}</div></div>
                    </div>
                    <div className="text-right"><span className="font-display font-bold text-xl text-charcoal">{plan.price}</span><span className="text-gray-400 text-sm">{plan.per}</span></div>
                  </label>
                ))}
              </div>
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="btn-outline flex-1 justify-center">← Back</button>
                <button onClick={handleFinalSubmit} disabled={loading} className="btn-gold flex-1 justify-center py-3.5">
                  {loading?'Setting up...':'Subscribe & Play →'}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">🔒 Secure checkout · 14-day money-back guarantee</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
