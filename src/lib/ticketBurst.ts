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
    // Explode from center bottom: spread widely left and right to cover the whole screen
    const driftX = -1200 + Math.random() * 2400; // wider spread

    return {
      id: `tb-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
      driftX,
      settleY: window.innerHeight ? window.innerHeight + 200 : 1200,
      liftY: 600 + Math.random() * 800, // shoot even higher to cover more vertical space
      spawnJitterX: -40 + Math.random() * 80,
      spawnJitterY: -20 + Math.random() * 40,
      rotation: (Math.random() - 0.5) * 360,
      delay: Math.random() * 400,
      brightness: 0.82 + Math.random() * 0.24,
      scale: 1.5 + Math.random() * 1.0, // MUCH larger tickets
      src: TICKET_SOURCES[Math.floor(Math.random() * TICKET_SOURCES.length)]!,
    };
  });
}
