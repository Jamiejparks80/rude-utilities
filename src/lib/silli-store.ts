import { supabase } from "@/integrations/supabase/client";

export type ServiceKey = "energy" | "broadband" | "council" | "water";

export type SilliMove = {
  firstName: string;
  surname: string;
  email: string;
  mobile: string;
  moveDate: string;
  residentialStatus: string;
  postcode: string;
  address: string;
  services: Record<ServiceKey, boolean>;
  bedrooms: string;
  propertyType: string;
  occupants: string;
  chosenPlan: string | null;
  chosenBroadband: string | null;
  council: string;
  water: string;
};

export const emptyMove: SilliMove = {
  firstName: "",
  surname: "",
  email: "",
  mobile: "",
  moveDate: "",
  residentialStatus: "",
  postcode: "",
  address: "",
  services: { energy: false, broadband: false, council: false, water: false },
  bedrooms: "",
  propertyType: "",
  occupants: "",
  chosenPlan: null,
  chosenBroadband: null,
  council: "Tower Hamlets Borough Council",
  water: "Thames Water",
};

const KEY = "silli-move";

export function loadMove(): SilliMove {
  if (typeof window === "undefined") return emptyMove;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...emptyMove, ...(JSON.parse(raw) as SilliMove) } : emptyMove;
  } catch {
    return emptyMove;
  }
}

export function saveMove(move: SilliMove) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(move));
}

/** Does this person's basic profile already exist, so we needn't ask again? */
export function hasBasics(move: SilliMove) {
  return Boolean(move.firstName && move.email && move.postcode);
}

type Row = {
  first_name: string;
  surname: string;
  email: string;
  mobile: string;
  move_date: string;
  residential_status: string;
  postcode: string;
  address: string;
  bedrooms: string;
  property_type: string;
  occupants: string;
  services: Record<string, boolean> | null;
  chosen_plan: string | null;
  chosen_broadband: string | null;
  council: string;
  water: string;
};

function rowToMove(row: Row): SilliMove {
  return {
    firstName: row.first_name ?? "",
    surname: row.surname ?? "",
    email: row.email ?? "",
    mobile: row.mobile ?? "",
    moveDate: row.move_date ?? "",
    residentialStatus: row.residential_status ?? "",
    postcode: row.postcode ?? "",
    address: row.address ?? "",
    services: { ...emptyMove.services, ...(row.services ?? {}) },
    bedrooms: row.bedrooms ?? "",
    propertyType: row.property_type ?? "",
    occupants: row.occupants ?? "",
    chosenPlan: row.chosen_plan,
    chosenBroadband: row.chosen_broadband,
    council: row.council || emptyMove.council,
    water: row.water || emptyMove.water,
  };
}

function moveToRow(move: SilliMove) {
  return {
    first_name: move.firstName,
    surname: move.surname,
    email: move.email,
    mobile: move.mobile,
    move_date: move.moveDate,
    residential_status: move.residentialStatus,
    postcode: move.postcode,
    address: move.address,
    bedrooms: move.bedrooms,
    property_type: move.propertyType,
    occupants: move.occupants,
    services: move.services,
    chosen_plan: move.chosenPlan,
    chosen_broadband: move.chosenBroadband,
    council: move.council,
    water: move.water,
  };
}

/** Load the signed-in person's saved profile, falling back to this device's copy. */
export async function loadProfile(): Promise<{ move: SilliMove; userId: string | null }> {
  const local = loadMove();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { move: local, userId: null };

  const { data: row } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!row) return { move: { ...local, email: local.email || user.email || "" }, userId: user.id };

  const remote = rowToMove(row as Row);
  const move: SilliMove = {
    ...remote,
    email: remote.email || user.email || "",
  };
  saveMove(move);
  return { move, userId: user.id };
}

/** Save to this device and, when signed in, to the account profile. */
export async function saveProfile(move: SilliMove) {
  saveMove(move);
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;
  await supabase
    .from("profiles")
    .upsert({ id: user.id, ...moveToRow(move) }, { onConflict: "id" });
}
