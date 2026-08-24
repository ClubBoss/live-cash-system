import type { PracticalTableState } from "../content/practical-mastery";

type Seat = PracticalTableState["seats"][number];

export const SIX_MAX_CLOCKWISE_POSITION_ORDER: Seat["position"][] = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];

export function arrangeSixMaxSeatRows(seats: PracticalTableState["seats"]): { top: Seat[]; bottom: Seat[] } {
  const byPosition = new Map(seats.map((seat) => [seat.position, seat]));
  const clockwise = SIX_MAX_CLOCKWISE_POSITION_ORDER
    .map((position) => byPosition.get(position))
    .filter((seat): seat is Seat => Boolean(seat));

  const ordered = seats.length === 6 && clockwise.length === 6 ? clockwise : [...seats];
  return {
    top: ordered.slice(0, 3),
    // Bottom is rendered left-to-right, while clockwise traversal crosses it right-to-left.
    bottom: ordered.slice(3).reverse(),
  };
}
