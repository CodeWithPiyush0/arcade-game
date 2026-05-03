import ticketStrip1 from "../assets/ticket_strip_1.png";
import ticketStrip2 from "../assets/ticket_strip_2.png";
import ticketStrip3 from "../assets/ticket_strip_3.png";

const TICKET_SOURCES = [ticketStrip1, ticketStrip2, ticketStrip3];

/** One ticket in the payout burst (CSS custom properties set from these) */
export type TicketBurstItem = {
  id: string;
  /** Horizontal travel in px from the bottom-right slot */
  driftX: number;
  /** Final downward offset in px (pile sits near machine bottom) */
  settleY: number;
  /** How high the ticket shoots before scattering */
  liftY: number;
  /** Tiny slot jitter so tickets do not overlap perfectly */
  spawnJitterX: number;
  spawnJitterY: number;
  rotation: number;
  delay: number;
  brightness: number;
  scale: number;
  src: string;
};

/** 30–50 tickets: aggressive full-screen payout from the bottom-right slot */
export function createTicketBursts(count: number): TicketBurstItem[] {
  return Array.from({ length: count }, (_, i) => {
    // Heavily bias to the left so tickets travel across the full width.
    const bucket = Math.random();
    let driftX = -220 - Math.random() * 340; // right/center region
    if (bucket < 0.6) driftX = -620 - Math.random() * 520; // center/left
    if (bucket < 0.25) driftX = -1120 - Math.random() * 520; // hard left edge
    if (bucket > 0.9) driftX = 60 + Math.random() * 220; // some right-side tickets

    return {
      id: `tb-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      driftX,
      settleY: 110 + Math.random() * 220,
      liftY: 170 + Math.random() * 220,
      spawnJitterX: -10 + Math.random() * 20,
      spawnJitterY: -8 + Math.random() * 16,
      rotation: (Math.random() - 0.5) * 140,
      delay: i * 52 + Math.random() * 240,
      brightness: 0.82 + Math.random() * 0.24,
      scale: 0.95 + Math.random() * 0.75,
      src: TICKET_SOURCES[Math.floor(Math.random() * TICKET_SOURCES.length)]!,
    };
  });
}
