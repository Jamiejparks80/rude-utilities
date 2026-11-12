import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/silli/Header";
import mascot from "@/assets/complaints-mascot.png";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Complaints procedure | Rude Utilities" },
      { name: "description", content: "Not today loser. The Rude Utilities complaints page." },
      { property: "og:title", content: "Complaints procedure | Rude Utilities" },
      { property: "og:description", content: "Not today loser. The Rude Utilities complaints page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <main className="silli-dots flex min-h-[calc(100svh-100px)] flex-col items-center justify-center px-6 py-10 text-center">
        <p className="font-display text-sm font-bold uppercase text-muted-foreground">Complaints procedure</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-primary sm:text-6xl">Not today loser</h1>
        <img
          src={mascot}
          alt="Our red furry friend making a cheeky gesture, with his raised finger hidden by a cartoon explosion"
          width={1024}
          height={1024}
          className="my-5 w-full max-w-[440px] motion-safe:animate-bob"
        />
        <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary underline underline-offset-4 transition-colors hover:text-foreground">
          <ArrowLeft className="size-5" /> Back to the boring stuff
        </Link>
      </main>
    </div>
  );
}