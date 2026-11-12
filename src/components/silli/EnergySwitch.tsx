import { useEffect, useState } from "react";
import { SupplierLogo } from "./SupplierLogo";
import { useServerFn } from "@tanstack/react-start";
import { PartyPopper } from "lucide-react";
import { Card, Field, PillButton, inputClass } from "@/components/silli/ui";
import { getEnergyQuote, submitSwitch, type LiveTariff } from "@/lib/energy-shop.functions";

type Basics = {
  postcode: string;
  address: string;
  bedrooms: string;
  occupants: string;
  firstName?: string;
  surname?: string;
  email?: string;
  mobile?: string;
  moveDate?: string;
};

export const COMMISSION_LINE = "We earn loads of commission every time you switch. So come back again, if you like. Story.";

export function EnergySwitch({
  basics,
  onSwitched,
}: {
  basics: Basics;
  onSwitched?: (label: string) => void;
}) {
  const quoteFn = useServerFn(getEnergyQuote);
  const switchFn = useServerFn(submitSwitch);
  const [live, setLive] = useState<{ loading: boolean; error: string | null; tariffs: LiveTariff[] }>({
    loading: true,
    error: null,
    tariffs: [],
  });
  const [picked, setPicked] = useState<LiveTariff | null>(null);
  const [form, setForm] = useState({
    title: "Mr",
    firstName: basics.firstName ?? "",
    lastName: basics.surname ?? "",
    email: basics.email ?? "",
    mobile: basics.mobile ?? "",
    dob: "",
    startDate: basics.moveDate ?? "",
    accountName: "",
    sortCode: "",
    accountNumber: "",
    dd: false,
  });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    setLive({ loading: true, error: null, tariffs: [] });
    quoteFn({
      data: {
        postcode: basics.postcode,
        address: basics.address,
        bedrooms: basics.bedrooms,
        occupants: basics.occupants,
      },
    })
      .then((r) => setLive({ loading: false, ...r }))
      .catch(() => setLive({ loading: false, error: "Something broke. Not our fault. Probably.", tariffs: [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basics.postcode, basics.address, basics.bedrooms, basics.occupants]);

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function send() {
    if (!picked) return;
    setErr(null);
    setSending(true);
    try {
      const r = await switchFn({
        data: {
          postcode: basics.postcode,
          address: basics.address,
          bedrooms: basics.bedrooms,
          occupants: basics.occupants,
          tariffId: picked.tariffId,
          annualCost: picked.annualCost,
          billGas: picked.billGas,
          billElec: picked.billElec,
          position: picked.position,
          title: form.title,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          mobile: form.mobile,
          dob: form.dob,
          startDate: form.startDate,
          accountName: form.accountName,
          sortCode: form.sortCode,
          accountNumber: form.accountNumber,
          ddAuthorisation: true,
        },
      });
      if (r.ok) {
        setDone(r.reference);
        onSwitched?.(`${picked.tariffName} - ${picked.supplierName}`);
      } else setErr(r.error);
    } catch {
      setErr("Some of that doesn't look right. Check your details and bank info.");
    } finally {
      setSending(false);
    }
  }

  if (done !== null && picked) {
    return (
      <Card tilt="left">
        <p className="font-display text-3xl font-extrabold text-primary">Switched. Done. Bye.</p>
        <p className="mt-3 font-semibold text-muted-foreground">
          You're moving to {picked.tariffName} with {picked.supplierName}. They'll email you, not us.
        </p>
        {done ? (
          <p className="mt-3 font-display font-bold">Your reference: {done}</p>
        ) : null}
        <p className="mt-4 rounded-2xl border-4 border-foreground bg-secondary px-4 py-3 font-display font-bold">
          {COMMISSION_LINE}
        </p>
      </Card>
    );
  }

  if (picked) {
    const ok =
      form.firstName && form.lastName && form.email && form.mobile && form.dob &&
      form.accountName && form.sortCode && form.accountNumber && form.dd;
    return (
      <Card tilt="right">
        <p className="font-display text-2xl font-extrabold text-primary">Switch me</p>
        <p className="mb-5 text-sm font-semibold text-muted-foreground">
          {picked.tariffName} with {picked.supplierName}, about £{picked.monthly.toFixed(2)} a month. Fill this in. No, we won't call you.
        </p>
        <div className="grid gap-x-4 sm:grid-cols-[110px_1fr_1fr]">
          <Field label="Title">
            <select className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)}>
              {["Mr", "Mrs", "Miss", "Ms", "Mx", "Dr"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="First name">
            <input className={inputClass} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          </Field>
          <Field label="Surname">
            <input className={inputClass} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field label="Email">
            <input className={inputClass} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Mobile">
            <input className={inputClass} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
          </Field>
          <Field label="Date of birth">
            <input className={inputClass} type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
          </Field>
          <Field label="Start supply from" hint="Usually your move-in date.">
            <input className={inputClass} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </Field>
        </div>
        <p className="mb-3 mt-2 font-display text-lg font-bold">Direct Debit. The bit you'll actually pay with.</p>
        <Field label="Name on the account">
          <input className={inputClass} value={form.accountName} onChange={(e) => set("accountName", e.target.value)} />
        </Field>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field label="Sort code">
            <input className={inputClass} placeholder="12-34-56" value={form.sortCode} onChange={(e) => set("sortCode", e.target.value)} />
          </Field>
          <Field label="Account number">
            <input className={inputClass} inputMode="numeric" maxLength={8} value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <label className="mb-5 flex items-start gap-3 text-sm font-semibold">
          <input type="checkbox" className="mt-1 size-5 accent-[var(--color-primary)]" checked={form.dd} onChange={(e) => set("dd", e.target.checked)} />
          I'm the account holder and I authorise Direct Debits from this account. Yes, really.
        </label>
        {err ? <p className="mb-4 font-semibold text-destructive">{err}</p> : null}
        <div className="flex flex-wrap justify-between gap-3">
          <PillButton variant="ghost" onClick={() => setPicked(null)}>← Other deals</PillButton>
          <PillButton onClick={() => void send()} disabled={!ok || sending}>
            {sending ? "Sending..." : "Switch me →"}
          </PillButton>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {live.loading ? (
        <Card><p className="font-display text-lg font-bold">Rummaging through the market. Hold your horses...</p></Card>
      ) : null}
      {live.error ? (
        <Card><p className="font-semibold text-muted-foreground">{live.error}</p></Card>
      ) : null}
      {live.tariffs.map((t, i) => (
        <div
          key={t.tariffId}
          className="animate-pop-in overflow-hidden rounded-3xl border-4 border-foreground bg-card shadow-[8px_8px_0_0_var(--color-foreground)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0"
          style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 1}deg)` }}
        >
          {i === 0 ? (
            <div className="flex items-center gap-2 border-b-4 border-foreground bg-primary px-4 py-2 font-display text-sm font-bold tracking-wide text-primary-foreground">
              <PartyPopper className="size-4 animate-wobble" strokeWidth={2.5} />
              CHEAPEST. YOU'RE WELCOME.
            </div>
          ) : null}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-bold text-foreground">{t.tariffName}</p>
                <p className="text-sm font-semibold text-muted-foreground">{t.fuel}</p>
              </div>
              <SupplierLogo name={t.supplierName} />
            </div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              {t.contractLength > 0
                ? `Fixed for ${t.contractLength} months. ${t.exitFee ? `£${t.exitFee.toFixed(2)} to escape early.` : "No exit fee."}`
                : "Variable. Prices go up whenever they fancy. No exit fees though."}
            </p>
            <ul className="mt-3 space-y-1 text-sm font-semibold text-muted-foreground">
              {t.bullets.map((b) => <li key={b}>★ {b}</li>)}
            </ul>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-2xl border-4 border-foreground bg-secondary px-4 py-2">
                <p className="text-xs font-bold text-muted-foreground">Est. monthly</p>
                <p className="font-display text-2xl font-extrabold text-primary">£{t.monthly.toFixed(2)}</p>
              </div>
              <PillButton onClick={() => setPicked(t)}>Switch me</PillButton>
            </div>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">Annual projection £{t.annualCost.toFixed(2)}</p>
          </div>
        </div>
      ))}
      {live.tariffs.length ? (
        <p className="text-center text-sm font-bold text-muted-foreground">{COMMISSION_LINE}</p>
      ) : null}
    </div>
  );
}
