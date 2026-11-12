import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/silli/Header";
import { Card, Field, PillButton, StepHeading, inputClass } from "@/components/silli/ui";
import { AddressFinder } from "@/components/silli/AddressFinder";
import { EnergySwitch } from "@/components/silli/EnergySwitch";
import { loadMove } from "@/lib/silli-store";

export const Route = createFileRoute("/energy")({
  head: () => ({
    meta: [
      { title: "Energy deals, no sign-up | Rude Utilities" },
      { name: "description", content: "Compare live energy tariffs for your new home and switch online. No account, no phone calls." },
      { property: "og:title", content: "Energy deals, no sign-up | Rude Utilities" },
      { property: "og:description", content: "Compare live energy tariffs for your new home and switch online. No account, no phone calls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EnergyPage,
});

function EnergyPage() {
  const [q, setQ] = useState({ postcode: "", address: "", bedrooms: "", occupants: "" });
  const [extra, setExtra] = useState({ firstName: "", surname: "", email: "", mobile: "", moveDate: "" });
  const [go, setGo] = useState(false);

  useEffect(() => {
    const m = loadMove();
    setQ({ postcode: m.postcode, address: m.address, bedrooms: m.bedrooms, occupants: m.occupants });
    setExtra({ firstName: m.firstName, surname: m.surname, email: m.email, mobile: m.mobile, moveDate: m.moveDate });
  }, []);

  const set = (k: keyof typeof q, v: string) => {
    setGo(false);
    setQ((s) => ({ ...s, [k]: v }));
  };

  return (
    <div className="min-h-screen silli-dots">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <StepHeading
          title="Energy deals. No sign-up."
          subtitle="Give us a postcode, we'll give you prices. That's the whole relationship."
        />
        <Card tilt="left" className="mb-8">
          <AddressFinder
            postcode={q.postcode}
            address={q.address}
            onChange={(v) => {
              setGo(false);
              setQ((s) => ({ ...s, ...v }));
            }}
          />
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Bedrooms">
              <select className={inputClass} value={q.bedrooms} onChange={(e) => set("bedrooms", e.target.value)}>
                <option value="">Please pick one</option>
                {["1", "2", "3", "4+"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="People living there">
              <select className={inputClass} value={q.occupants} onChange={(e) => set("occupants", e.target.value)}>
                <option value="">Please pick one</option>
                {["1", "2", "3", "4+"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
          <PillButton onClick={() => setGo(true)} disabled={q.postcode.trim().length < 5 || !q.bedrooms}>
            Show me deals →
          </PillButton>
        </Card>
        {go ? <EnergySwitch basics={{ ...q, ...extra }} /> : null}
      </main>
    </div>
  );
}
