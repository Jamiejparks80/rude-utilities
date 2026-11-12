import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Field, PillButton, inputClass } from "@/components/silli/ui";
import { lookupPostcode, type FoundAddress } from "@/lib/postcodes.functions";

export function AddressFinder({
  postcode,
  address,
  onChange,
}: {
  postcode: string;
  address: string;
  onChange: (v: { postcode: string; address: string }) => void;
}) {
  const lookup = useServerFn(lookupPostcode);
  const [list, setList] = useState<FoundAddress[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function find() {
    setBusy(true);
    setErr(null);
    try {
      const r = await lookup({ data: { postcode } });
      setList(r.addresses);
      setErr(r.error);
    } catch {
      setErr("Check that postcode, genius.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Field label="Postcode at your new home">
        <div className="flex gap-3">
          <input
            className={inputClass}
            value={postcode}
            onChange={(e) => onChange({ postcode: e.target.value, address })}
            onKeyDown={(e) => e.key === "Enter" && void find()}
          />
          <PillButton onClick={() => void find()} disabled={postcode.trim().length < 5 || busy} className="shrink-0 px-5">
            {busy ? "..." : "Find"}
          </PillButton>
        </div>
      </Field>
      {err ? <p className="-mt-3 mb-4 text-sm font-semibold text-destructive">{err}</p> : null}
      {list.length ? (
        <Field label="Pick your address">
          <select
            className={inputClass}
            value={list.some((a) => a.label === address) ? address : ""}
            onChange={(e) => {
              const a = list.find((x) => x.label === e.target.value);
              if (a) onChange({ postcode: a.postcode, address: a.label });
            }}
          >
            <option value="">{list.length} addresses. Find yours.</option>
            {list.map((a) => (
              <option key={a.label} value={a.label}>{a.label}</option>
            ))}
          </select>
        </Field>
      ) : (
        <Field label="Your address">
          <input
            className={inputClass}
            placeholder="Flat 2, 14 Example Street"
            value={address}
            onChange={(e) => onChange({ postcode, address: e.target.value })}
          />
        </Field>
      )}
    </>
  );
}
