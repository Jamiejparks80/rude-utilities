import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Popcorn, Stamp, Waves, type LucideIcon } from "lucide-react";

import { Header } from "@/components/silli/Header";
import { Blob, Card, PillButton } from "@/components/silli/ui";
import mascot from "@/assets/silli-mascot.png";
import { loadProfile, type SilliMove } from "@/lib/silli-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your move board | Rude Utilities" },
      {
        name: "description",
        content: "See what you have sorted for your new home and what you are still avoiding.",
      },
      { property: "og:title", content: "Your move board | Rude Utilities" },
      {
        property: "og:description",
        content: "See what you have sorted for your new home and what you are still avoiding.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Panel({
  icon: Icon,
  title,
  status,
  tilt,
  children,
}: {
  icon: LucideIcon;
  title: string;
  status: "Incomplete" | "Sorted!";
  tilt: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="animate-pop-in overflow-hidden rounded-3xl border-4 border-foreground bg-card shadow-[8px_8px_0_0_var(--color-foreground)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="flex items-center justify-between border-b-4 border-foreground bg-primary px-4 py-2.5">
        <div className="flex items-center gap-2 font-display text-lg font-bold text-primary-foreground">
          <Icon className="size-5" strokeWidth={2.5} />
          {title}
        </div>
        <span
          className={`rounded-full border-4 border-foreground px-3 py-0.5 font-display text-xs font-bold ${
            status === "Sorted!" ? "bg-card text-primary" : "animate-squish bg-secondary"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="px-4 py-4 text-sm font-semibold text-muted-foreground">{children}</div>
    </div>
  );
}

function Dashboard() {
  const [move, setMove] = useState<SilliMove | null>(null);
  useEffect(() => {
    loadProfile().then(({ move: loaded }) => setMove(loaded));
  }, []);

  if (!move) return null;
  const name = move.firstName || "you";
  const picked = Object.values(move.services).some(Boolean);

  return (
    <div className="min-h-screen overflow-x-hidden silli-dots">
      <Header />
      <main className="relative mx-auto max-w-3xl px-6 py-12">
        <Blob className="left-[-5rem] top-16 size-64" />

        <div className="flex items-end gap-3">
          <img
            src={mascot}
            alt="Rude Utilities mascot"
            width={1024}
            height={1024}
            className="w-24 animate-bob"
          />
          <div className="mb-2">
            <h1 className="font-display text-3xl font-extrabold text-primary">Hi {name}!</h1>
            <p className="text-sm font-semibold text-muted-foreground">
              Here&apos;s the boring stuff you&apos;ve sorted, and the bits you&apos;re still avoiding.
            </p>
          </div>
        </div>

        <div className="mt-9 space-y-6">
          {!picked ? (
            <Card tilt="left">
              <p className="font-display text-xl font-bold text-primary">Nothing on the list yet!</p>
              <p className="text-sm font-semibold text-muted-foreground">
                Tell me which jobs to take on and I'll get cracking.
              </p>
              <Link to="/start" className="mt-3 inline-block">
                <PillButton>Pick my jobs →</PillButton>
              </Link>
            </Card>
          ) : null}

          {move.services.energy ? (
            <Panel
              icon={Flame}
              title="Energy"
              status={move.chosenPlan ? "Sorted!" : "Incomplete"}
              tilt={-1}
            >
              {move.chosenPlan ? (
                <p>
                  You picked <strong className="text-foreground">{move.chosenPlan}</strong>. I'll get
                  it all switched over for your move-in day.
                </p>
              ) : (
                <>
                  <p>You haven't picked an energy deal yet. Shall we finish it off?</p>
                  <Link to="/start" className="mt-3 inline-block">
                    <PillButton>Finish it →</PillButton>
                  </Link>
                </>
              )}
            </Panel>
          ) : null}

          {move.services.broadband ? (
            <Panel
              icon={Popcorn}
              title="Broadband/TV"
              status={move.chosenBroadband ? "Sorted!" : "Incomplete"}
              tilt={1}
            >
              {move.chosenBroadband ? (
                <p>
                  You picked <strong className="text-foreground">{move.chosenBroadband}</strong>.
                  They'll be in touch to book your install.
                </p>
              ) : (
                <>
                  <p>No broadband package picked yet. Let's find you something speedy.</p>
                  <Link to="/start" className="mt-3 inline-block">
                    <PillButton>Finish it →</PillButton>
                  </Link>
                </>
              )}
            </Panel>
          ) : null}

          {move.services.council ? (
            <Panel icon={Stamp} title="Council Tax" status="Sorted!" tilt={-1}>
              <p>
                Your council is <strong className="text-foreground">{move.council}</strong>. I'll
                tell them you're moving in. They'll sort a payment plan with you.
              </p>
            </Panel>
          ) : null}

          {move.services.water ? (
            <Panel icon={Waves} title="Water" status="Sorted!" tilt={1}>
              <p>
                Your water authority is <strong className="text-foreground">{move.water}</strong>.
                They'll be in touch about paying them.
              </p>
            </Panel>
          ) : null}
        </div>
      </main>
    </div>
  );
}
