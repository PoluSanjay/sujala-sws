import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Award, ArrowRight, Building2, CheckCircle2, CircleAlert, Droplets, Factory, Home as HomeIcon, Phone, Search, ShieldCheck, ShoppingCart, Sparkles, Waves, Wrench } from 'lucide-react';
import { API_URL, Empty, Seo, SectionTitle, Spinner, api, date, imageUrl, money, useAuth, useCart, useToast } from './lib.jsx';
import { ProductCard } from './shell.jsx';

const query = (path, key) => useQuery({ queryKey: key || [path], queryFn: () => api(path) });
const Status = ({ children }) => <span className="status">{String(children || 'pending').replaceAll('_', ' ')}</span>;

const offerings = [
  [HomeIcon, 'Domestic RO', 'Compact, high-purity RO for homes.'],
  [Building2, 'Commercial RO', 'For offices, restaurants, cafés.'],
  [Factory, 'Industrial Plants', 'Large-scale RO up to 1000+ LPH.'],
  [Waves, 'Water Softeners', 'Whole-house hard water treatment.'],
  [Wrench, 'Installation & Repair', 'Trained technicians, prompt service.'],
  [ShieldCheck, 'AMC Plans', 'Yearly maintenance with genuine parts.'],
];

const trustPoints = [
  [Award, 'Certified experts', 'Trained, background-verified technicians.'],
  [Sparkles, 'Fast response', 'Prompt scheduling across serviceable areas.'],
  [CheckCircle2, 'Genuine parts', 'Only OEM-approved membranes & filters.'],
  [ShieldCheck, 'Transparent pricing', 'No hidden charges. Ever.'],
];

export function Home() {
  const { data, isLoading } = query('/products?limit=4', ['featured']);
  return (
    <>
      <Seo title="Sujala Water Solutions" description="Premium water purifiers, RO installation and lifelong water care." />

      <section className="hero">
        <div className="shell">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Water care, engineered for trust</span>
              <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Pure water for the life you are building.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-white/80">
                Sujala Water Solutions brings premium purification, precise installation and lifelong support to your doorstep.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/products" className="btn btn-primary">
                  Explore purifiers <ArrowRight size={18} />
                </Link>
                <Link to="/services" className="btn btn-white">
                  Book a service
                </Link>
                <a href="tel:+919949792248" className="btn btn-outline">
                  Call now
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                {[['7-stage', 'Purification'], ['24×7', 'Service support'], ['1 yr', 'Warranty included']].map((item) => (
                  <div key={item[0]} className="hero-chip">
                    <b>{item[0]}</b>
                    <span className="ml-2 text-white/70">{item[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <div className="grid h-48 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-slate-950/25">
                <img
                  src="/hero.jpg"
                  alt="Sujala Water Solutions purifier"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-5">
                <span className="eyebrow">SWS assurance</span>
                <p className="mt-2 text-lg font-semibold text-white">Clean water. Every day.</p>
                <p className="mt-1 text-sm text-white/70">7-stage care · Purify with confidence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-16">
        <SectionTitle eyebrow="Explore" title="What we offer" />
        <p className="mt-3 text-muted">From compact home RO to full industrial plants.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map(([Icon, title, desc]) => (
            <div className="card p-5" key={title}>
              <Icon className="text-brand" size={28} />
              <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="shell">
          <div className="flex items-center justify-between">
            <SectionTitle eyebrow="Featured" title="Popular purifiers" />
            <Link to="/products" className="link">
              View all products →
            </Link>
          </div>
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data?.products?.map((product) => <ProductCard product={product} key={product._id} />)}
            </div>
          )}
        </div>
      </section>

      <section className="shell py-16">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white lg:p-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold">Why households trust SWS</h2>
              <p className="mt-4 text-white/80">
                A focused team, transparent pricing and a long-term view of water care.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {trustPoints.map(([Icon, title, desc]) => (
                <div className="flex gap-3" key={title}>
                  <Icon className="text-brand-light shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-white">{title}</h4>
                    <p className="mt-1 text-sm text-white/70">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <span className="eyebrow">SWS service desk</span>
              <h2 className="font-display mt-3 text-3xl font-bold text-ink">Need installation or maintenance?</h2>
              <p className="mt-4 text-muted">
                Get a trusted technician for installation, annual maintenance or a service visit.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/services" className="btn btn-primary">
                  Book service
                </Link>
                <a href="tel:+919949792248" className="btn btn-secondary">
                  Call now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function Products() {
  const [category, setCategory] = useState('');
  const [term, setTerm] = useState('');
  const { data: categoryData } = query('/categories', ['categories']);
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', category, term],
    queryFn: () =>
      api('/products?limit=24' + (category ? '&category=' + category : '') + (term ? '&q=' + encodeURIComponent(term) : '')),
  });
  return (
    <div className="shell py-10">
      <Seo title="Products" />
      <SectionTitle eyebrow="Catalog" title="All products" />
      <div className="mt-5 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            className="input pl-10"
            placeholder="Search purifiers, filters and accessories"
          />
        </div>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="input">
          <option value="">All categories</option>
          {categoryData?.categories?.map((item) => (
            <option value={item._id} key={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <div className="mt-8 text-danger">{error.message}</div>
      ) : data?.products?.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.products.map((product) => <ProductCard product={product} key={product._id} />)}
        </div>
      ) : (
        <Empty className="mt-8" title="No products found" detail="Try a different search or category." />
      )}
    </div>
  );
}

export function ProductDetail() {
  const { slug } = useParams({ from: '/product/$slug' });
  const { data, isLoading, error } = query('/products/' + slug, ['product', slug]);
  const { add, clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  if (isLoading) return <Spinner />;
  if (error) return <div className="shell py-16"><Empty title="Product not found" detail={error.message} /></div>;
  const product = data.product;
  const price = product.discount_price ?? product.price;
  return (
    <div className="shell py-10">
      <Seo title={product.name} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card grid place-items-center overflow-hidden p-6">
          {product.images?.[0] ? (
            <img src={imageUrl(product.images[0])} alt={product.name} className="h-80 object-contain" />
          ) : (
            <Droplets size={80} className="text-muted" />
          )}
        </div>
        <div>
          <span className="eyebrow">{product.category_id?.name || 'SWS water care'}</span>
          <h1 className="font-display mt-2 text-3xl font-bold text-ink">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand">{money(price)}</span>
            {product.discount_price && <span className="text-lg text-muted line-through">{money(product.price)}</span>}
          </div>
          <p className="mt-5 text-body">{product.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(product.specifications || {}).map(([label, value]) => (
              <div className="rounded-lg bg-surface p-3 text-sm" key={label}>
                <span className="text-muted">{label}</span>
                <p className="font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">
            {product.stock ? product.stock + ' units ready to order' : 'Currently out of stock'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={!product.stock}
              onClick={() => {
                add(product);
                toast(product.name + ' added to cart');
              }}
              className="btn btn-secondary disabled:opacity-50"
            >
              <ShoppingCart size={18} /> Add to cart
            </button>
            <button
              disabled={!product.stock}
              onClick={() => {
                clear();
                add(product);
                navigate({ to: '/checkout' });
              }}
              className="btn btn-primary disabled:opacity-50"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Services() {
  const { account } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ category: 'RO/UV installation', description: '', priority: 'normal' });
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api('/complaints', { method: 'POST', body: form });
      toast('Service request created: ' + result.complaint.ticket_number);
      setForm({ category: form.category, description: '', priority: 'normal' });
    } catch (error) {
      toast(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="shell py-10">
      <Seo title="Services" />
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <span className="eyebrow">Trusted after-sales care</span>
          <h1 className="font-display mt-3 text-3xl font-bold text-ink">Service that keeps your water worry-free.</h1>
          <p className="mt-5 text-muted">
            From a precise first installation to preventive AMC visits, the SWS service desk keeps every system performing its best.
          </p>
          <div className="mt-8 grid gap-5">
            {[
              ['RO/UV installation', 'Careful set-up, pressure checks and handover.'],
              ['Maintenance & repair', 'Diagnosis and genuine-part service for your purifier.'],
              ['Annual maintenance plan', 'Reliable scheduled care for lasting performance.'],
            ].map((item) => (
              <div className="card p-5" key={item[0]}>
                <h3 className="font-semibold text-ink">{item[0]}</h3>
                <p className="mt-1 text-sm text-muted">{item[1]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold">Book a visit</h2>
          {account ? (
            <form className="mt-5 space-y-4" onSubmit={submit}>
              <label>
                Service needed
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="input">
                  <option>RO/UV installation</option>
                  <option>Maintenance & repair</option>
                  <option>Annual maintenance plan</option>
                  <option>Water purifier consultation</option>
                </select>
              </label>
              <label>
                Tell us what you need
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="input"
                  rows={4}
                  placeholder="Include model, issue, preferred time or address details."
                  required
                />
              </label>
              <button disabled={busy} className="btn btn-primary">
                {busy ? 'Booking…' : 'Request service'}
              </button>
            </form>
          ) : (
            <div className="mt-5">
              <p className="text-sm leading-6 text-muted">Sign in to submit and track a service request from your SWS workspace.</p>
              <Link to="/auth" className="btn btn-primary mt-5">
                Sign in to book
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <div className="shell py-10">
      <Seo title="About us" />
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">About Sujala Water Solutions</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-ink">
          A cleaner glass of water, backed by people who care.
        </h1>
        <p className="mt-7 text-lg leading-8 text-body">
          Sujala Water Solutions is built around a simple promise: honest guidance, dependable water purification and service that remains close after installation.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            ['Premium', 'Thoughtfully selected purification'],
            ['Local', 'Responsive installation & support'],
            ['Trusted', 'Clear pricing and accountable care'],
          ].map((item) => (
            <div key={item[0]} className="card p-5">
              <b className="text-brand-light">{item[0]}</b>
              <p className="mt-2 text-sm text-muted">{item[1]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <div className="shell py-10">
      <Seo title="Contact" />
      <SectionTitle eyebrow="Here when you need us" title="Talk to the SWS team" />
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ['Call us', '+91 9949792248', 'tel:+919949792248'],
          ['Email us', 'sujalawatersolutions@gmail.com', 'mailto:sujalawatersolutions@gmail.com'],
          ['Find us', 'Open Google Maps', 'https://maps.app.goo.gl/YTEotBoCWof5gvMJA'],
        ].map((item) => (
          <a href={item[2]} className="card p-6 text-center" key={item[0]}>
            <h3 className="font-semibold text-ink">{item[0]}</h3>
            <p className="mt-2 text-sm text-muted">{item[1]}</p>
          </a>
        ))}
      </div>
      <div className="mt-8 text-center">
        <p className="text-muted">Prefer WhatsApp?</p>
        <a href="https://wa.me/919949792248" className="btn btn-primary mt-3">
          Message SWS for a quick response.
        </a>
      </div>
    </div>
  );
}

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const { signIn, account } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const google = useRef(null);

  useEffect(() => {
    if (account) {
      navigate({ to: account.roles.includes('admin') ? '/admin' : account.roles.includes('technician') ? '/technician' : '/dashboard' });
    }
  }, [account]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const start = () =>
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await signIn(await api('/auth/google', { method: 'POST', body: { credential: response.credential } }));
            toast('Signed in with Google');
          } catch (error) {
            toast(error.message);
          }
        },
      });
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      start();
      window.google?.accounts.id.renderButton(google.current, { theme: 'outline', size: 'large', width: 320 });
    };
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await api('/auth/' + (mode === 'login' ? 'login' : 'register'), {
        method: 'POST',
        body: mode === 'login' ? { email: form.email, password: form.password } : form,
      });
      await signIn(result);
      toast(mode === 'login' ? 'Welcome back' : 'Your SWS account is ready');
    } catch (error) {
      toast(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-10">
      <div className="card w-full max-w-md p-7">
        <p className="eyebrow">Your SWS workspace</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <div className="mt-5 flex gap-2 rounded-lg bg-surface p-1">
          <button className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === 'login' ? 'bg-white shadow' : ''}`} onClick={() => setMode('login')}>
            Sign in
          </button>
          <button className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === 'register' ? 'bg-white shadow' : ''}`} onClick={() => setMode('register')}>
            Register
          </button>
        </div>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label>
                Full name
                <input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="input" required />
              </label>
              <label>
                Phone
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="input" required />
              </label>
            </>
          )}
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="input" required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="input" required />
          </label>
          <button disabled={busy} className="btn btn-primary w-full">
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in securely' : 'Create account'}
          </button>
        </form>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <>
            <div className="my-5 text-center text-sm text-muted">OR</div>
            <div ref={google} className="w-full" />
          </>
        ) : (
          <p className="mt-5 text-center text-sm text-muted">Google Sign-In becomes available after VITE_GOOGLE_CLIENT_ID is configured.</p>
        )}
      </div>
    </div>
  );
}

export function Track() {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);
    try {
      setResult(await api('/track/' + encodeURIComponent(number.trim())));
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="shell py-10">
      <Seo title="Track" />
      <div className="mx-auto max-w-xl">
        <SectionTitle eyebrow="Always in the know" title="Track your order or service ticket" />
        <p className="mt-3 text-muted">Enter an SWS-ORD or SWS-TKT reference number.</p>
        <form onSubmit={submit} className="mt-6 flex gap-3">
          <input value={number} onChange={(event) => setNumber(event.target.value)} className="input flex-1" placeholder="SWS-ORD-0001" />
          <button className="btn btn-primary">Track</button>
        </form>
        {error && <div className="mt-5 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">{error}</div>}
        {result && (
          <div className="mt-5 card p-6">
            <h2 className="text-lg font-bold">
              {result.type === 'order' ? result.record.order_number : result.record.ticket_number}
            </h2>
            <Status>{result.record.status}</Status>
            <p className="mt-2 text-sm text-muted">
              {result.type === 'order'
                ? 'Payment: ' + result.record.payment_method.replace('_', ' ') + ' · ' + result.record.payment_status
                : result.record.category + ' · ' + result.record.priority + ' priority'}
            </p>
            <p className="mt-1 text-sm text-muted">Created {date(result.record.created_at)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function Checkout() {
  const { account } = useAuth();
  const { items, subtotal, clear } = useCart();
  const { data: settingData } = query('/settings/public', ['public-settings']);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', pincode: '', state: '', payment_method: 'cod',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (account) {
      setForm((current) => ({
        ...current,
        name: account.profile?.full_name || account.user.full_name || '',
        phone: account.profile?.phone || account.user.phone || '',
        email: account.user.email,
        address: account.profile?.address || '',
        city: account.profile?.city || '',
        pincode: account.profile?.pincode || '',
        state: account.profile?.state || '',
      }));
    }
  }, [account]);

  const shipping = subtotal >= (settingData?.shipping?.free_shipping_threshold || 0) ? 0 : settingData?.shipping?.flat_shipping_fee || 0;
  const tax = Math.round(subtotal * (settingData?.shipping?.gst_rate || 0)) / 100;

  const submit = async (event) => {
    event.preventDefault();
    if (!items.length) return toast('Your cart is empty');
    setBusy(true);
    try {
      const result = await api('/orders', {
        method: 'POST',
        body: {
          items: items.map((item) => ({ product_id: item._id, quantity: item.quantity })),
          delivery_address: form,
          payment_method: form.payment_method,
        },
      });
      clear();
      toast('Order placed successfully');
      navigate({ to: '/order/$number', params: { number: result.order.order_number } });
    } catch (error) {
      toast(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (!items.length) {
    return (
      <div className="shell py-16">
        <Empty title="Your cart is empty" detail="Add a product before checking out." />
        <Link to="/products" className="btn btn-primary mt-5">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="shell py-10">
      <Seo title="Checkout" />
      <h1 className="font-display text-3xl font-bold text-ink">Checkout</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_.4fr]">
        <form className="card space-y-5 p-6" onSubmit={submit}>
          <h2 className="text-lg font-bold">Delivery details</h2>
          {[
            ['name', 'Full name'],
            ['phone', 'Phone'],
            ['email', 'Email'],
            ['city', 'City'],
            ['pincode', 'Pincode'],
            ['state', 'State'],
          ].map((item) => (
            <label key={item[0]}>
              {item[1]}
              <input value={form[item[0]]} onChange={(event) => setForm({ ...form, [item[0]]: event.target.value })} className="input" required />
            </label>
          ))}
          <label>
            Full address
            <textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="input" rows={3} required />
          </label>
          <div className="border-t border-line pt-5">
            <h2 className="mb-3 text-lg font-bold">Payment method</h2>
            <label className="mb-2 flex cursor-pointer gap-3 rounded-lg border border-line p-3">
              <input type="radio" checked={form.payment_method === 'cod'} onChange={() => setForm({ ...form, payment_method: 'cod' })} />
              <span>
                <b>Cash on Delivery</b>
                <small className="mt-1 block text-muted">Pay when your order arrives.</small>
              </span>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-lg border border-line p-3">
              <input type="radio" checked={form.payment_method === 'bank_transfer'} onChange={() => setForm({ ...form, payment_method: 'bank_transfer' })} />
              <span>
                <b>Bank Transfer / UPI</b>
                <small className="mt-1 block text-muted">Your order is confirmed after SWS verifies payment.</small>
              </span>
            </label>
            {form.payment_method === 'bank_transfer' && (
              <div className="mt-3 rounded-lg bg-mint p-4 text-sm text-body">
                <b className="text-ink">Transfer details</b>
                <p className="mt-2">UPI: {settingData?.payment?.upi_id || 'To be confirmed by SWS'}</p>
                <p>{settingData?.payment?.bank_name} · {settingData?.payment?.account_name}</p>
                <p>A/C: {settingData?.payment?.account_number} · IFSC: {settingData?.payment?.ifsc}</p>
                <p className="mt-2 text-muted">{settingData?.payment?.instructions}</p>
              </div>
            )}
          </div>
          <button disabled={busy} className="btn btn-primary">
            {busy ? 'Placing order…' : 'Place order securely'}
          </button>
        </form>
        <aside className="card h-fit p-6">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="mt-4 grid gap-3">
            {items.map((item) => (
              <div className="flex justify-between gap-3 text-sm" key={item._id}>
                <span>{item.name} × {item.quantity}</span>
                <b>{money(item.price * item.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping ? money(shipping) : 'Free'}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between">
                <span>GST</span>
                <span>{money(tax)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{money(subtotal + shipping + tax)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { number } = useParams({ from: '/order/$number' });
  const { data, isLoading, error } = query('/orders/' + number, ['order', number]);
  if (isLoading) return <Spinner />;
  if (error) return <div className="shell py-16"><Empty title="Order not found" detail={error.message} /></div>;
  const order = data.order;
  return (
    <div className="shell py-10">
      <Seo title={'Order ' + order.order_number} />
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Order confirmed in your account</p>
          <h1 className="mt-1 text-2xl font-bold">{order.order_number}</h1>
        </div>
        <Status>{order.status}</Status>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_.7fr]">
        <div className="card p-6">
          <h2 className="font-bold">Items</h2>
          <div className="mt-4 grid gap-4">
            {order.items.map((item) => (
              <div className="flex justify-between border-b border-line pb-4 text-sm" key={item.product_id}>
                <span>{item.name} × {item.quantity}</span>
                <b>{money(item.price * item.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{money(order.total)}</span>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-bold">Delivery & payment</h2>
          <p className="mt-4 text-sm leading-6 text-body">
            {order.delivery_address.name}<br />
            {order.delivery_address.address}<br />
            {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.pincode}<br />
            {order.delivery_address.phone}
          </p>
          <div className="mt-5 flex gap-2">
            <Status>{order.payment_method}</Status>
            <Status>{order.payment_status}</Status>
          </div>
          {order.payment_method === 'bank_transfer' && order.payment_status !== 'paid' && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Your bank transfer is pending SWS verification. We will confirm the order when payment is verified.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
