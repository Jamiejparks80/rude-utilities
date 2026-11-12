import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Flame, Wifi, Stamp, Waves, PartyPopper, Gauge, CalendarClock } from "lucide-react";

import { Header } from "@/components/silli/Header";
import { Blob, Card, Field, PillButton, StepHeading, inputClass } from "@/components/silli/ui";
import mascot from "@/assets/silli-mascot.png";
import { broadbandDeals } from "@/lib/silli-deals";
import { AddressFinder } from "@/components/silli/AddressFinder";
import { EnergySwitch } from "@/components/silli/EnergySwitch";
import {
  emptyMove,
  hasBasics,
  loadProfile,
  saveProfile,
  type ServiceKey,
  type SilliMove,
} from "@/lib/silli-store";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Sort your move | Rude Utilities" },
      {
        name: "description",
        content:
          "Answer a few questions and sort energy, broadband, council tax and water without calling anyone.",
      },
      { property: "og:title", content: "Sort your move | Rude Utilities" },
      {
        property: "og:description",
        content:
          "Answer a few questions and sort energy, broadband, council tax and water without calling anyone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Start,
});

type StepId =
  | "details"
  | "contact"
  | "home"
  | "services"
  | "councilwater"
  | "energyQuote"
  | "energyPlans"
  | "broadband";

const serviceList: {
  key: ServiceKey;
  icon: typeof Flame;
  title: string;
  body: string;
  note?: string;
}[] = [
  {
    key: "energy",
    icon: Flame,
    title: "Energy",
    body: "We'll sniff out the meter details at your new place, see who supplies it and show you the cheapest deals we've got.",
    note: "Do nothing and you'll land on a standard variable tariff. We'll find something less grim.",
  },
  {
    key: "broadband",
    icon: Wifi,
    title: "Broadband/TV",
    body: "See what packages reach your street, check download speeds and compare 100's of deals.",
  },
  {
    key: "council",
    icon: Stamp,
    title: "Council Tax",
    body: "We find your new council and tell them you're moving in, plus how to set up payments.",
  },
  {
    key: "water",
    icon: Waves,
    title: "Water",
    body: "We find your water authority and let them know you've arrived, plus how to pay them.",
  },
];

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-3 rounded-full border-2 border-foreground transition-all duration-300 ${
            i === step
              ? "w-9 animate-squish bg-primary"
              : i < step
                ? "w-3 bg-primary"
                : "w-3 bg-card"
          }`}
        />
      ))}
    </div>
  );
}

function Mascot({ line }: { line: string }) {
  return (
    <div className="mb-6 flex items-end gap-3">
      <img
        src={mascot}
        alt="Rude Utilities mascot"
        loading="lazy"
        width={1024}
        height={1024}
        className="w-20 shrink-0 animate-bob"
      />
      <p className="mb-2 rotate-1 rounded-3xl rounded-bl-none border-4 border-foreground bg-card px-4 py-2 font-display text-sm font-bold shadow-[4px_4px_0_0_var(--color-foreground)]">
        {line}
      </p>
    </div>
  );
}

function Start() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [move, setMove] = useState<SilliMove>(emptyMove);
  const [ready, setReady] = useState(false);

  const steps = useMemo<StepId[]>(() => {
    const list: StepId[] = ["details", "contact", "home", "services"];
    if (move.services.council || move.services.water) list.push("councilwater");
    if (move.services.energy) list.push("energyQuote", "energyPlans");
    if (move.services.broadband) list.push("broadband");
    return list;
  }, [move.services]);

  useEffect(() => {
    loadProfile().then(({ move: loaded }) => {
      setMove(loaded);
      // Already told us the basics? Skip straight to picking jobs.
      if (hasBasics(loaded)) setIndex(3);
      setReady(true);
    });
  }, []);

  const step = steps[Math.min(index, steps.length - 1)];

  const set = <K extends keyof SilliMove>(key: K, value: SilliMove[K]) =>
    setMove((m) => ({ ...m, [key]: value }));

  const next = () => {
    void saveProfile(move);
    setIndex((s) => s + 1);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => setIndex((s) => Math.max(0, s - 1));

  const finishStep = async (updated: SilliMove) => {
    setMove(updated);
    await saveProfile(updated);
    const remaining = steps.slice(index + 1);
    if (remaining.length > 0) {
      setIndex((s) => s + 1);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen overflow-x-hidden silli-dots">
      <Header />
      <main className="relative mx-auto max-w-2xl px-6 py-10">
        <Blob className="right-[-5rem] top-24 size-64" />
        <Progress step={index} total={steps.length} />

        {step === "details" && (
          <div key="details">
            <Mascot line="Hi! Who am I helping move?" />
            <StepHeading
              title="Let's check your details."
              subtitle="Nothing scary, promise. Just a name."
            />
            <Card tilt="left">
              <Field label="First Name">
                <input
                  className={inputClass}
                  value={move.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
              </Field>
              <Field label="Surname">
                <input
                  className={inputClass}
                  value={move.surname}
                  onChange={(e) => set("surname", e.target.value)}
                />
              </Field>
              <div className="flex justify-end">
                <PillButton onClick={next} disabled={!move.firstName}>
                  Onwards →
                </PillButton>
              </div>
            </Card>
          </div>
        )}

        {step === "contact" && (
          <div key="contact">
            <Mascot line="Where shall I send the good news?" />
            <StepHeading
              title="Now your contact bits."
              subtitle="Check these carefully. I'll use them to keep you posted."
            />
            <Card tilt="right">
              <Field label="Email address">
                <input
                  type="email"
                  className={inputClass}
                  value={move.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field
                label="Mobile phone number"
                hint="A valid UK mobile, no spaces, starting with 07"
              >
                <input
                  className={inputClass}
                  value={move.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                />
              </Field>
              <div className="flex justify-between">
                <PillButton variant="ghost" onClick={back}>
                  ← Back
                </PillButton>
                <PillButton onClick={next} disabled={!move.email}>
                  Onwards →
                </PillButton>
              </div>
            </Card>
          </div>
        )}

        {step === "home" && (
          <div key="home">
            <Mascot line="Ooh, a new home! Where is it?" />
            <StepHeading
              title="About your new place."
              subtitle="When you're moving in, and where I should be pointing."
            />
            <Card tilt="left">
              <Field label="Your expected move in date">
                <input
                  type="date"
                  className={inputClass}
                  value={move.moveDate}
                  onChange={(e) => set("moveDate", e.target.value)}
                />
              </Field>
              <Field label="Residential status">
                <select
                  className={inputClass}
                  value={move.residentialStatus}
                  onChange={(e) => set("residentialStatus", e.target.value)}
                >
                  <option value="">Please pick one</option>
                  <option>Owner occupier</option>
                  <option>Tenant</option>
                  <option>Living with family</option>
                </select>
              </Field>
              <AddressFinder
                postcode={move.postcode}
                address={move.address}
                onChange={(v) => setMove((m) => ({ ...m, ...v }))}
              />
              <div className="flex justify-between">
                <PillButton variant="ghost" onClick={back}>
                  ← Back
                </PillButton>
                <PillButton onClick={next} disabled={!move.postcode}>
                  Onwards →
                </PillButton>
              </div>
            </Card>
          </div>
        )}

        {step === "services" && (
          <div key="services">
            <Mascot line="Flick the switches and I'll only bother you about those." />
            <StepHeading
              title="Pick your jobs."
              subtitle="Switch on whatever you'd like me to organise. I'll skip the rest entirely."
            />
            <div className="space-y-4">
              {serviceList.map((s, i) => (
                <Card key={s.key} className="p-5" tilt={i % 2 ? "right" : "left"}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-10 items-center justify-center rounded-xl border-4 border-foreground bg-primary text-primary-foreground animate-squish">
                        <s.icon className="size-5" strokeWidth={2.5} />
                      </span>
                      <h3 className="font-display text-xl font-bold text-primary">{s.title}</h3>
                    </div>
                    <button
                      onClick={() =>
                        set("services", { ...move.services, [s.key]: !move.services[s.key] })
                      }
                      aria-pressed={move.services[s.key]}
                      aria-label={`Toggle ${s.title}`}
                      className={`h-8 w-14 shrink-0 rounded-full border-4 border-foreground p-0.5 transition-colors ${
                        move.services[s.key] ? "bg-primary" : "bg-secondary"
                      }`}
                    >
                      <span
                        className={`block size-6 rounded-full border-2 border-foreground bg-card transition-transform duration-300 ${
                          move.services[s.key] ? "translate-x-6 rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-muted-foreground">{s.body}</p>
                  {s.note ? (
                    <p className="mt-3 -rotate-1 rounded-2xl border-4 border-foreground bg-secondary px-4 py-2 text-xs font-bold text-foreground">
                      {s.note}
                    </p>
                  ) : null}
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <PillButton variant="ghost" onClick={back}>
                ← Back
              </PillButton>
              <PillButton
                onClick={() => void finishStep(move)}
                disabled={!Object.values(move.services).some(Boolean)}
              >
                Onwards →
              </PillButton>
            </div>
          </div>
        )}

        {step === "councilwater" && (
          <div key="councilwater">
            <Mascot line="I'll do the paperwork. You do the snacks." />
            <StepHeading
              title={
                move.services.council && move.services.water
                  ? "Council and water, handled."
                  : move.services.council
                    ? "Council tax, handled."
                    : "Water, handled."
              }
              subtitle="On move day I'll tell them you've arrived. They'll be in touch about payment plans."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {move.services.council ? (
                <Card className="text-center" tilt="left">
                  <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl border-4 border-foreground bg-primary text-primary-foreground animate-squish">
                    <Stamp className="size-7" strokeWidth={2.5} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-muted-foreground">
                    Your new council is:
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-primary">{move.council}</p>
                </Card>
              ) : null}
              {move.services.water ? (
                <Card className="text-center" tilt="right">
                  <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl border-4 border-foreground bg-primary text-primary-foreground animate-squish">
                    <Waves className="size-7" strokeWidth={2.5} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-muted-foreground">
                    Your water authority is:
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-primary">{move.water}</p>
                </Card>
              ) : null}
            </div>
            <div className="mt-6 flex justify-between">
              <PillButton variant="ghost" onClick={back}>
                ← Back
              </PillButton>
              <PillButton onClick={() => void finishStep(move)}>Onwards →</PillButton>
            </div>
          </div>
        )}

        {step === "energyQuote" && (
          <div key="energyQuote">
            <Mascot line="Three quick ones for your energy quote." />
            <StepHeading title="How big is this place then?" />
            <Card tilt="right">
              <Field label="How many bedrooms?">
                <select
                  className={inputClass}
                  value={move.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                >
                  <option value="">Please pick one</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </Field>
              <Field label="Type of property?">
                <select
                  className={inputClass}
                  value={move.propertyType}
                  onChange={(e) => set("propertyType", e.target.value)}
                >
                  <option value="">Please pick one</option>
                  <option>Flat</option>
                  <option>Terraced house</option>
                  <option>Semi-detached house</option>
                  <option>Detached house</option>
                </select>
              </Field>
              <Field label="How many people will live there?">
                <select
                  className={inputClass}
                  value={move.occupants}
                  onChange={(e) => set("occupants", e.target.value)}
                >
                  <option value="">Please pick one</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </Field>
              <div className="flex justify-between">
                <PillButton variant="ghost" onClick={back}>
                  ← Back
                </PillButton>
                <PillButton onClick={next} disabled={!move.bedrooms}>
                  Show me deals →
                </PillButton>
              </div>
            </Card>
          </div>
        )}

        {step === "energyPlans" && (
          <div key="energyPlans">
            <Mascot line="Ta-da! Here's what I dug up." />
            <StepHeading
              title="Pick an energy plan"
              subtitle="Estimates based on your new postcode and the size of your home."
            />
            <EnergySwitch
              basics={move}
              onSwitched={(label) => { const m = { ...move, chosenPlan: label }; setMove(m); void saveProfile(m); }}
            />
            <div className="mt-6 flex justify-between">
              <PillButton variant="ghost" onClick={back}>
                ← Back
              </PillButton>
              <PillButton variant="ghost" onClick={() => void finishStep({ ...move })}>
                Skip for now
              </PillButton>
            </div>
          </div>
        )}

        {step === "broadband" && (
          <div key="broadband">
            <Mascot line="Now for the internet. Pick your poison." />
            <StepHeading
              title="Pick a broadband package"
              subtitle="These all reach your street. Prices include line rental, with no daft extras."
            />
            <div className="space-y-6">
              {broadbandDeals.map((d, i) => (
                <div
                  key={d.id}
                  className="animate-pop-in overflow-hidden rounded-3xl border-4 border-foreground bg-card shadow-[8px_8px_0_0_var(--color-foreground)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0"
                  style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 1}deg)` }}
                >
                  {d.badge ? (
                    <div className="flex items-center gap-2 border-b-4 border-foreground bg-primary px-4 py-2 font-display text-sm font-bold tracking-wide text-primary-foreground">
                      <PartyPopper className="size-4 animate-wobble" strokeWidth={2.5} />
                      {d.badge}
                    </div>
                  ) : null}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className="inline-block -rotate-2 rounded-xl border-4 border-foreground px-3 py-1 font-display text-sm font-extrabold text-white"
                          style={{ backgroundColor: d.colour }}
                        >
                          {d.provider}
                        </span>
                        <p className="mt-2 font-display text-xl font-bold text-foreground">
                          {d.name}
                        </p>
                      </div>
                      <span className="inline-flex size-10 items-center justify-center rounded-xl border-4 border-foreground bg-secondary animate-squish">
                        <Wifi className="size-5" strokeWidth={2.5} />
                      </span>
                    </div>

                    <p className="mt-3 -rotate-1 rounded-2xl border-4 border-foreground bg-secondary px-4 py-2 text-xs font-bold">
                      Our blunt take: {d.silliSays}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="inline-flex items-center gap-1 rounded-full border-4 border-foreground bg-card px-3 py-1">
                        <Gauge className="size-4" strokeWidth={2.5} />
                        {d.speed}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border-4 border-foreground bg-card px-3 py-1">
                        <CalendarClock className="size-4" strokeWidth={2.5} />
                        {d.contract}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1 text-sm font-semibold text-muted-foreground">
                      {d.bullets.map((b) => (
                        <li key={b}>★ {b}</li>
                      ))}
                    </ul>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="rounded-2xl border-4 border-foreground bg-secondary px-4 py-2">
                        <p className="text-xs font-bold text-muted-foreground">Per month</p>
                        <p className="font-display text-2xl font-extrabold text-primary">
                          £{d.monthly.toFixed(2)}
                        </p>
                      </div>
                      <PillButton onClick={() => void finishStep({ ...move, chosenBroadband: d.id })}>
                        Grab this one
                      </PillButton>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">{d.setup}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <PillButton variant="ghost" onClick={back}>
                ← Back
              </PillButton>
              <PillButton variant="ghost" onClick={() => void finishStep({ ...move })}>
                Skip for now
              </PillButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
