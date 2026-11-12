import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";

import { Header } from "@/components/silli/Header";
import { Blob, Card, Field, PillButton, inputClass } from "@/components/silli/ui";
import mascot from "@/assets/silli-mascot.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in | Rude Utilities" },
      {
        name: "description",
        content:
          "Log in or create your Rude Utilities account so we remember your move details and do not ask twice.",
      },
      { property: "og:title", content: "Log in | Rude Utilities" },
      {
        property: "og:description",
        content:
          "Log in or create your Rude Utilities account so we remember your move details and do not ask twice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (err) throw err;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
      navigate({ to: "/start" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wonky. Try again?");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign in didn't work. Try again?");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/start" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden silli-dots">
      <Header />
      <main className="relative mx-auto max-w-md px-6 py-12">
        <Blob className="right-[-4rem] top-20 size-56" />

        <div className="mb-6 flex items-end gap-3">
          <img src={mascot} alt="Rude Utilities mascot" width={1024} height={1024} className="w-20 animate-bob" />
          <p className="mb-2 rotate-1 rounded-3xl rounded-bl-none border-4 border-foreground bg-card px-4 py-2 font-display text-sm font-bold shadow-[4px_4px_0_0_var(--color-foreground)]">
            {mode === "in" ? "Back again? Fine. I kept your notes." : "Make an account. We won't call you."}
          </p>
        </div>

        {checkEmail ? (
          <Card tilt="left">
            <div className="flex items-center gap-2 font-display text-xl font-bold text-primary">
              <PartyPopper className="size-6 animate-wobble" strokeWidth={2.5} />
              Check your email!
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              I've sent a confirmation link to <strong className="text-foreground">{email}</strong>.
               Click it and you&apos;re in. Then we won&apos;t ask for the same details again.
            </p>
          </Card>
        ) : (
          <Card tilt="left">
            <form onSubmit={submit} className="space-y-4">
              <Field label="Email address">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field
                label="Password"
                {...(mode === "up"
                  ? { hint: "Make it a strong one: letters, numbers and a symbol" }
                  : {})}
              >
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {error ? (
                <p className="-rotate-1 rounded-2xl border-4 border-foreground bg-secondary px-4 py-2 text-xs font-bold">
                  {error}
                </p>
              ) : null}
              <PillButton type="submit" disabled={busy} className="w-full">
                {busy ? "Hang on…" : mode === "in" ? "Log me in →" : "Create my account →"}
              </PillButton>
            </form>

            <div className="my-2 text-center font-display text-xs font-bold text-muted-foreground">
              or
            </div>

            <PillButton type="button" variant="ghost" onClick={google} className="w-full">
              Continue with Google
            </PillButton>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "in" ? "up" : "in");
                setError(null);
              }}
              className="mt-2 w-full text-center text-sm font-bold text-primary underline"
            >
              {mode === "in" ? "No account yet? Sign up" : "Already with us? Log in"}
            </button>

            <p className="text-center text-xs font-semibold text-muted-foreground">
              We&apos;ll keep you logged in here. Fewer passwords, fewer reasons to contact us.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
