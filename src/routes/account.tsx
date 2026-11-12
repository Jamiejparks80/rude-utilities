import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Mail, Phone, Calendar, BedDouble, Users, MapPin, Stamp, Waves, Flame, Popcorn, type LucideIcon } from "lucide-react";

import { Header } from "@/components/silli/Header";
import { Blob, Card, PillButton, Field, inputClass } from "@/components/silli/ui";
import mascot from "@/assets/silli-mascot.png";
import { loadProfile, saveProfile, type SilliMove, type ServiceKey } from "@/lib/silli-store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account | Rude Utilities" },
      { name: "description", content: "Your saved move details and the utility jobs on your list." },
      { property: "og:title", content: "My account | Rude Utilities" },
      { property: "og:description", content: "Your saved move details and the utility jobs on your list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});

const SERVICE_LABELS: Record<ServiceKey, { label: string; icon: LucideIcon }> = {
  energy: { label: "Energy", icon: Flame },
  broadband: { label: "Broadband/TV", icon: Popcorn },
  council: { label: "Council Tax", icon: Stamp },
  water: { label: "Water", icon: Waves },
};

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b-2 border-dashed border-foreground/20 py-2.5 last:border-0">
      <span className="font-display text-sm font-bold text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-bold text-foreground">{value || "Not provided"}</span>
    </div>
  );
}

function Account() {
  const [move, setMove] = useState<SilliMove | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<SilliMove | null>(null);

  useEffect(() => {
    loadProfile().then(({ move: loaded }) => {
      setMove(loaded);
      setDraft(loaded);
    });
  }, []);

  if (!move || !draft) return null;

  const picked = (Object.keys(move.services) as ServiceKey[]).filter((k) => move.services[k]);

  const save = async () => {
    setSaving(true);
    await saveProfile(draft);
    setMove(draft);
    setEditing(false);
    setSaving(false);
  };

  const update = <K extends keyof SilliMove>(key: K, value: SilliMove[K]) =>
    setDraft({ ...draft, [key]: value });

  return (
    <div className="min-h-screen overflow-x-hidden silli-dots">
      <Header />
      <main className="relative mx-auto max-w-3xl px-6 py-12">
        <Blob className="right-[-5rem] top-10 size-64" />

        <div className="flex items-end gap-3">
          <img
            src={mascot}
            alt="Rude Utilities mascot"
            width={1024}
            height={1024}
            className="w-20 animate-bob"
          />
          <div className="mb-1">
            <h1 className="font-display text-3xl font-extrabold text-primary">My account</h1>
            <p className="text-sm font-semibold text-muted-foreground">
              Everything we know about your move. Edit it yourself. Obviously.
            </p>
          </div>
        </div>

        {/* About you */}
        <Card tilt="left" className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-primary">About you</h2>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full border-4 border-foreground bg-secondary px-4 py-1 font-display text-xs font-bold transition-transform hover:-translate-y-0.5"
              >
                Edit
              </button>
            ) : null}
          </div>

          {!editing ? (
            <div>
              <Row label="First name" value={move.firstName} />
              <Row label="Surname" value={move.surname} />
              <Row label="Email" value={move.email} />
              <Row label="Mobile" value={move.mobile} />
              <Row label="Move-in date" value={move.moveDate} />
              <Row label="Residential status" value={move.residentialStatus} />
            </div>
          ) : (
            <div className="grid gap-1 sm:grid-cols-2">
              <Field label="First name">
                <input className={inputClass} value={draft.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </Field>
              <Field label="Surname">
                <input className={inputClass} value={draft.surname} onChange={(e) => update("surname", e.target.value)} />
              </Field>
              <Field label="Email">
                <input className={inputClass} type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <Field label="Mobile">
                <input className={inputClass} value={draft.mobile} onChange={(e) => update("mobile", e.target.value)} />
              </Field>
              <Field label="Move-in date">
                <input className={inputClass} type="date" value={draft.moveDate} onChange={(e) => update("moveDate", e.target.value)} />
              </Field>
              <Field label="Residential status">
                <select className={inputClass} value={draft.residentialStatus} onChange={(e) => update("residentialStatus", e.target.value)}>
                  <option value="">Select…</option>
                  <option value="Tenant">Tenant</option>
                  <option value="Homeowner">Homeowner</option>
                  <option value="Living with family">Living with family</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>
          )}
        </Card>

        {/* Your new home */}
        <Card tilt="right" className="mt-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Your new home</h2>
          {!editing ? (
            <div>
              <Row label="Address" value={move.address} />
              <Row label="Postcode" value={move.postcode} />
              <Row label="Bedrooms" value={move.bedrooms} />
              <Row label="Property type" value={move.propertyType} />
              <Row label="Occupants" value={move.occupants} />
            </div>
          ) : (
            <div className="grid gap-1 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Address">
                  <input className={inputClass} value={draft.address} onChange={(e) => update("address", e.target.value)} />
                </Field>
              </div>
              <Field label="Postcode">
                <input className={inputClass} value={draft.postcode} onChange={(e) => update("postcode", e.target.value)} />
              </Field>
              <Field label="Bedrooms">
                <select className={inputClass} value={draft.bedrooms} onChange={(e) => update("bedrooms", e.target.value)}>
                  <option value="">Select…</option>
                  <option value="Studio">Studio</option>
                  <option value="1 bed">1 bed</option>
                  <option value="2 bed">2 bed</option>
                  <option value="3 bed">3 bed</option>
                  <option value="4 bed">4 bed</option>
                  <option value="5+ bed">5+ bed</option>
                </select>
              </Field>
              <Field label="Property type">
                <select className={inputClass} value={draft.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
                  <option value="">Select…</option>
                  <option value="Flat">Flat</option>
                  <option value="House">House</option>
                  <option value="Bungalow">Bungalow</option>
                  <option value="Maisonette">Maisonette</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Occupants">
                <input className={inputClass} value={draft.occupants} onChange={(e) => update("occupants", e.target.value)} />
              </Field>
            </div>
          )}
        </Card>

        {/* Your services */}
        <Card tilt="left" className="mt-6">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">Jobs on your list</h2>
          {picked.length === 0 ? (
            <p className="text-sm font-semibold text-muted-foreground">
              No jobs picked yet. {" "}
              <Link to="/start" className="text-primary underline">
                pick my jobs →
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {picked.map((key) => {
                const { label, icon: Icon } = SERVICE_LABELS[key];
                const chosen = key === "energy" ? move.chosenPlan : key === "broadband" ? move.chosenBroadband : null;
                return (
                  <div key={key} className="flex items-center gap-3 rounded-2xl border-2 border-foreground/20 bg-secondary/40 px-3 py-2.5">
                    <Icon className="size-5 shrink-0 text-primary" strokeWidth={2.5} />
                    <div className="flex-1">
                      <p className="font-display text-sm font-bold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        {key === "council" || key === "water"
                          ? "Sorted!"
                          : chosen
                            ? `Picked: ${chosen}`
                            : "Incomplete"}
                      </p>
                    </div>
                    {key === "council" || key === "water" ? null : (
                      <span
                        className={`rounded-full border-2 border-foreground px-2.5 py-0.5 font-display text-xs font-bold ${
                          chosen ? "bg-card text-primary" : "bg-secondary"
                        }`}
                      >
                        {chosen ? "Sorted!" : "Incomplete"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {picked.length > 0 && (move.services.council || move.services.water) ? (
            <div className="mt-4 space-y-2">
              {move.services.council ? <Row label="Council" value={move.council} /> : null}
              {move.services.water ? <Row label="Water authority" value={move.water} /> : null}
            </div>
          ) : null}
        </Card>

        {editing ? (
          <div className="mt-6 flex gap-3">
            <PillButton onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </PillButton>
            <PillButton variant="ghost" onClick={() => { setDraft(move); setEditing(false); }}>
              Cancel
            </PillButton>
          </div>
        ) : (
          <div className="mt-8 flex gap-3">
            <Link to="/dashboard">
              <PillButton variant="ghost">← My board</PillButton>
            </Link>
            <Link to="/start">
              <PillButton>Edit my jobs →</PillButton>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
