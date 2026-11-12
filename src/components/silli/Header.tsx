import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setSignedIn(Boolean(session));
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const pill =
    "rounded-full border-4 border-foreground bg-primary px-5 py-1.5 font-display text-sm font-bold text-primary-foreground shadow-[3px_3px_0_0_var(--color-foreground)] transition-transform hover:-translate-y-0.5";

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b-4 border-foreground bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link
          to="/"
          aria-label="Rude Utilities home"
          className="font-display text-2xl font-extrabold text-primary transition-transform duration-300 hover:-translate-y-0.5 sm:text-3xl"
        >
          rude utilities.
        </Link>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-full border-4 border-foreground bg-secondary px-4 py-1.5 font-display text-sm font-bold sm:block"
              >
                My board
              </Link>
              <Link
                to="/account"
                className="hidden rounded-full border-4 border-foreground bg-secondary px-4 py-1.5 font-display text-sm font-bold sm:block"
              >
                My account
              </Link>
              <button type="button" onClick={signOut} className={pill}>
                Log Out
              </button>
            </>
          ) : (
            <Link to="/auth" className={pill}>
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
