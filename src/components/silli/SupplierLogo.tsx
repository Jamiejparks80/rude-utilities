import { useState } from "react";
import soEnergy from "@/assets/suppliers/so-energy.webp";
import eonNext from "@/assets/suppliers/eon-next.png";
import fuse from "@/assets/suppliers/fuse.png";
import britishGas from "@/assets/suppliers/british-gas.png";

const wiki = (f: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=300`;

const LOGOS: Record<string, string> = {
  "british gas": britishGas,
  "so energy": soEnergy,
  "e.on": eonNext,
  "eon": eonNext,
  "fuse": fuse,
  "octopus": wiki("Octopus Energy logo (2019).svg"),
  "ovo": wiki("Ovo Energy logo.svg"),
  "good energy": wiki("Good Energy logo 2019.png"),
};

function logoFor(name: string) {
  const n = name.toLowerCase();
  const key = Object.keys(LOGOS).find((k) => n.includes(k));
  return key ? LOGOS[key] : null;
}

export function SupplierLogo({ name }: { name: string }) {
  const src = logoFor(name);
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <p className="font-display text-sm font-bold text-primary">{name}</p>;
  }
  return (
    <img
      src={src}
      alt={`${name} logo`}
      title={name}
      className="h-10 w-auto max-w-[140px] shrink-0 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
