import type { CSSProperties } from "react";
import type { TicketBurstItem } from "../lib/ticketBurst";

type Props = {
  items: TicketBurstItem[];
};

/** Full-screen celebration layer: tickets emit bottom-right, overlap UI, pointer-events none */
export function TicketBurstLayer({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="ticket-burst-layer" aria-hidden="true">
      {items.map((t) => {
        const vars = {
          "--tb-drift-x": `${t.driftX}px`,
          "--tb-settle-y": `${t.settleY}px`,
          "--tb-lift-y": `${t.liftY}px`,
          "--tb-spawn-jitter-x": `${t.spawnJitterX}px`,
          "--tb-spawn-jitter-y": `${t.spawnJitterY}px`,
          "--tb-rot": `${t.rotation}deg`,
          "--tb-brightness": String(t.brightness),
          "--tb-scale": String(t.scale),
        } as CSSProperties;
        return (
          <img
            key={t.id}
            src={t.src}
            alt=""
            className="ticket-burst__ticket"
            style={{
              ...vars,
              animationDelay: `${t.delay}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
