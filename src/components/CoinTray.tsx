import { useRef, useState } from "react";
import { useSound } from "../hooks/useSound";
import fiveRupee from "../assets/Five_Rupee.png";
import moneyRack from "../assets/Money_rack.svg";
import oneRupee from "../assets/One_Rupee.png";
import tenRupee from "../assets/Ten_Rupee.png";
import tenRupeeNote from "../assets/Ten_Rupee_Note.png";
import twentyRupee from "../assets/Twenty_Rupee.png";
import twentyRupeeNote from "../assets/Twenty_Rupee_Note.png";
import twoRupee from "../assets/Two_Rupee.png";

const PICKUP_SOUND = "/sounds/coin.mp3"; // NEW: soft pickup on drag start

const moneyItems = [
  { type: "coin", value: 1, alt: "One rupee", className: "money-tray__coin", src: oneRupee },
  { type: "coin", value: 2, alt: "Two rupee", className: "money-tray__coin", src: twoRupee },
  { type: "coin", value: 5, alt: "Five rupee", className: "money-tray__coin", src: fiveRupee },
  { type: "coin", value: 10, alt: "Ten rupee", className: "money-tray__coin", src: tenRupee },
  { type: "coin", value: 20, alt: "Twenty rupee", className: "money-tray__coin", src: twentyRupee },

  { type: "note", value: 10, alt: "Ten note", className: "money-tray__note", src: tenRupeeNote },
  { type: "note", value: 20, alt: "Twenty note", className: "money-tray__note", src: twentyRupeeNote },
];

export default function CoinTray() {
  const playPickup = useSound(PICKUP_SOUND, 0.58); // NEW: user gesture — drag start only

  // NEW: drag UX — which tray cell is active + cleanup for custom drag preview
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const dragGhostElRef = useRef<HTMLDivElement | null>(null);

  const removeDragGhost = () => {
    dragGhostElRef.current?.remove();
    dragGhostElRef.current = null;
  };

  return (
    <section className="money-tray" aria-label="Money tray">
      <img
        alt=""
        aria-hidden="true"
        className="money-tray__rack"
        src={moneyRack}
      />

      <div className="money-tray__items">
        {moneyItems.map((item) => (
          <div
            key={item.alt}
            className={`money-tray__item ${item.type === "note" ? "money-tray__item--note" : ""} ${
              draggingKey === item.alt ? "money-tray__item--dragging" : ""
            }`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("item", JSON.stringify(item));
              e.dataTransfer.effectAllowed = "copy";
              playPickup(); // NEW: pickup SFX (user initiated)
              setDraggingKey(item.alt);

              // NEW: custom drag preview (semi-transparent + cyan glow via CSS class)
              const cell = e.currentTarget;
              const img = cell.querySelector("img");
              if (img) {
                removeDragGhost();
                const ghost = document.createElement("div");
                ghost.className = "money-tray__drag-ghost";
                const clone = img.cloneNode(true) as HTMLImageElement;
                clone.removeAttribute("draggable");
                ghost.appendChild(clone);
                document.body.appendChild(ghost);
                dragGhostElRef.current = ghost;
                const r = img.getBoundingClientRect();
                e.dataTransfer.setDragImage(ghost, r.width / 2, r.height / 2);
              }
            }}
            onDragEnd={() => {
              setDraggingKey(null);
              removeDragGhost();
            }}
          >
            <img alt={item.alt} className={item.className} src={item.src} draggable={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
