import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wifi,
  Flame,
  Stamp,
  Waves,
  Sparkles,
  ShoppingBasket,
  Cookie,
  Timer,
  Gift,
  ShieldCheck,
} from "lucide-react";

import { Header } from "@/components/silli/Header";
import { Blob } from "@/components/silli/ui";
import mascot from "@/assets/silli-mascot.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rude Utilities | Get the boring stuff sorted" },
      {
        name: "description",
        content:
          "Rude Utilities is the fully self-service way to sort energy, broadband/TV, council tax and water for your new home.",
      },
      { property: "og:title", content: "Rude Utilities | Get the boring stuff sorted" },
      {
        property: "og:description",
        content:
          "Rude Utilities is the fully self-service way to sort energy, broadband/TV, council tax and water for your new home.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Wifi, label: "Broadband/TV", to: "/start" as const },
  { icon: Flame, label: "Energy", to: "/energy" as const },
  { icon: Stamp, label: "Council", to: "/start" as const },
  { icon: Waves, label: "Water", to: "/start" as const },
];

const benefits = [
  {
    icon: ShoppingBasket,
    title: "One stop set-up",
    body: "Energy, broadband/TV, council and water. All sorted without a painful phone call.",
  },
  {
    icon: Cookie,
    title: "Free to use",
    body: "No hidden charges and no subscriptions. You're welcome, cheapskates.",
  },
  {
    icon: Timer,
    title: "Five minutes flat",
    body: "Unless you're old and over the hill. Then you might struggle to do it in 15.",
  },
  {
    icon: Gift,
    title: "Loads of choice",
    body: "Deals from big-name suppliers, lined up side by side. Prices, speeds, contracts, blah blah blah.",
  },
  {
    icon: ShieldCheck,
    title: "Safe hands",
    body: "We don't want to be your friend. You won't hear from us once you're done. You'll be ghosted until you come crawling back.",
  },
];

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />

      <section className="relative silli-dots border-b-4 border-foreground">
        <Blob className="left-[-6rem] top-10 size-72" />
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 py-12 md:grid-cols-2">
          <div className="relative order-2 flex justify-center md:order-1">
            <img
              src={mascot}
              alt="Rude Utilities' fuzzy red mascot wearing a cardboard box hat"
              width={1024}
              height={1024}
              className="w-64 animate-bob drop-shadow-2xl sm:w-80"
            />
          </div>

          <div className="order-1 text-center md:order-2 md:text-left">
            <span className="inline-block -rotate-2 rounded-full border-4 border-foreground bg-primary px-4 py-1 font-display text-sm font-bold text-primary-foreground">
              Moving home? Eek!
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
              Right. Let&apos;s get on with the{" "}
              <span className="relative inline-block text-primary animate-wobble">boring stuff.</span>
            </h1>
            <p className="mt-5 text-base font-semibold text-muted-foreground">
              We don&apos;t want to talk to you. You don&apos;t want to talk to us. Sort broadband,
              energy and the rest online, entirely by yourself. Lovely.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              {services.map((s, i) => (
                <Link
                  to={s.to}
                  key={s.label}
                  className="flex items-center gap-2 rounded-full border-4 border-foreground bg-card px-3 py-1.5 shadow-[3px_3px_0_0_var(--color-foreground)] transition-transform hover:-translate-y-1 hover:rotate-3"
                  style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 2}deg)` }}
                >
                  <s.icon className="size-4 text-primary" strokeWidth={2.5} />
                  <span className="font-display text-sm font-bold">{s.label}</span>
                </Link>
              ))}
            </div>

            <Link
              to="/start"
              className="mt-8 inline-flex items-center gap-2 rounded-full border-4 border-foreground bg-primary px-8 py-3 font-display text-lg font-bold text-primary-foreground shadow-[6px_6px_0_0_var(--color-foreground)] transition-all hover:-translate-y-1 hover:shadow-[6px_10px_0_0_var(--color-foreground)] active:translate-y-0.5"
            >
              <Sparkles className="size-5 animate-wobble" strokeWidth={2.5} />
              Get it over with
            </Link>
            <p className="mt-4 text-xs font-semibold text-muted-foreground">
              By starting, you agree to the terms of use, privacy policy and cookies.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5">
        {benefits.map((b, i) => (
          <div
            key={b.title}
            className="rounded-3xl border-4 border-foreground bg-card p-5 shadow-[6px_6px_0_0_var(--color-foreground)] transition-transform duration-300 hover:-translate-y-2 hover:rotate-0"
            style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 1.5}deg)` }}
          >
            <span className="inline-flex size-12 items-center justify-center rounded-2xl border-4 border-foreground bg-primary text-primary-foreground animate-squish">
              <b.icon className="size-6" strokeWidth={2.5} />
            </span>
            <h3 className="mt-3 font-display text-lg font-bold text-primary">{b.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
              {b.body}
            </p>
          </div>
        ))}
      </section>

      <footer className="border-t-4 border-foreground bg-secondary py-8 text-center">
        <p className="font-display text-lg font-bold text-primary">rude utilities.</p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          Moving is rubbish. This makes the boring bits less rubbish.
        </p>
        <Link to="/complaints" className="mt-4 inline-block text-sm font-bold text-primary underline underline-offset-4 hover:text-foreground">
          Complaints procedure
        </Link>
      </footer>
    </div>
  );
}
