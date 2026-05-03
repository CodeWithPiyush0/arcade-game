import { useEffect, useRef, useState } from "react";
import { useSound } from "../hooks/useSound";
import decorativeElement from "../assets/Decorative_element.svg";
import checkBtn from "../assets/Check_Btn.svg"; // NEW
import resetBtn from "../assets/Reset_Btn.svg"; // NEW

const ARROW_CELLS = new Set([
  "0-2",
  "0-3",
  "0-4",
  "1-2",
  "1-3",
  "1-4",
  "2-2",
  "2-3",
  "2-4",
  "3-2",
  "3-3",
  "3-4",
  "4-2",
  "4-3",
  "4-4",
  "5-2",
  "5-3",
  "5-4",
  "6-0",
  "6-1",
  "6-2",
  "6-3",
  "6-4",
  "6-5",
  "6-6",
  "7-1",
  "7-2",
  "7-3",
  "7-4",
  "7-5",
  "8-2",
  "8-3",
  "8-4",
  "9-3",
]);

const DROP_SOUND = "/sounds/drop.mp3"; // NEW: coin/note landed
const CLICK_SOUND = "/sounds/click.mp3"; // NEW: check button confirm beep

export default function DropZone({
  items,
  status,
  wrongFeedbackTick,
  onDropItem,
  onCheck,
  onReset,
}: {
  items: { src: string; className: string }[];
  status: string;
  wrongFeedbackTick: number;
  onDropItem: (item: { src: string; className: string; value: number; type?: string; alt?: string }) => void;
  onCheck: () => void;
  onReset: () => void;
}) {
  const playDrop = useSound(DROP_SOUND, 0.65); // NEW: successful drop only
  const playClick = useSound(CLICK_SOUND, 0.62); // NEW: check button
  const playResetSoft = useSound(CLICK_SOUND, 0.42); // NEW: optional quieter reuse

  // NEW: highlight zone while a draggable is over it (robust leave via relatedTarget)
  const [isDragOver, setIsDragOver] = useState(false);

  // NEW: bounce only the item that was just added
  const [bounceIndex, setBounceIndex] = useState<number | null>(null);
  const prevItemCountRef = useRef(items.length);

  useEffect(() => {
    const prev = prevItemCountRef.current;
    if (items.length > prev) {
      setBounceIndex(items.length - 1);
      const t = window.setTimeout(() => setBounceIndex(null), 380);
      prevItemCountRef.current = items.length;
      return () => window.clearTimeout(t);
    }
    prevItemCountRef.current = items.length;
  }, [items.length]);

  return (
    <section
      key={status === "wrong" ? `wrong-${wrongFeedbackTick}` : "drop-zone-stable"}
      className={`drop-zone ${status} ${items.length > 0 ? "has-items" : ""} ${
        isDragOver ? "drop-zone--drag-over" : ""
      }`}
      aria-label="Drop money here"
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        const next = e.relatedTarget as Node | null;
        if (next && e.currentTarget.contains(next)) return;
        setIsDragOver(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        setIsDragOver(false);
        const data = e.dataTransfer.getData("item");
        if (data) {
          playDrop(); // NEW: clink only when payload valid (user drop gesture)
          const parsed = JSON.parse(data);
          onDropItem(parsed);
        }
      }}
    >
      <img className="drop-zone__corner drop-zone__corner--top-left" src={decorativeElement} />
      <img className="drop-zone__corner drop-zone__corner--top-right" src={decorativeElement} />
      <img className="drop-zone__corner drop-zone__corner--bottom-left" src={decorativeElement} />
      <img className="drop-zone__corner drop-zone__corner--bottom-right" src={decorativeElement} />

      {/* SHOW ONLY WHEN EMPTY */}
      {items.length === 0 && (
        <div className="drop-zone__empty">
          <div className="pixel-arrow" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, row) =>
              Array.from({ length: 7 }).map((__, col) => (
                <span
                  className={ARROW_CELLS.has(`${row}-${col}`) ? "is-on" : ""}
                  key={`${row}-${col}`}
                />
              )),
            )}
          </div>
          <div className="drop-zone__label">
            <svg
              aria-hidden="true"
              fill="none"
              height="21"
              viewBox="0 0 24 24"
              width="21"
            >
              <path
                d="M8 11V7.5a1.5 1.5 0 0 1 3 0V11"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M11 10V6.5a1.5 1.5 0 0 1 3 0V11"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M14 11V8a1.5 1.5 0 0 1 3 0v5.5c0 4-2.5 6.5-6.5 6.5H10c-2.4 0-4.2-1.1-5.3-3.1L3 13.8a1.6 1.6 0 0 1 2.7-1.7L7 14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>DRAG & DROP MONEY HERE</span>
          </div>
        </div>
      )}

      {/* Dropped items only when present — avoids empty spacer shifting the placeholder */}
      {items.length > 0 && (
        <div className="drop-zone__items">
          {items.map((item, i) => (
            <img
              key={i}
              src={item.src}
              className={`${item.className} ${bounceIndex === i ? "drop-zone__item--drop-bounce" : ""}`}
              alt=""
            />
          ))}
        </div>
      )}

      {/* NEW: buttons */}
      {items.length > 0 && (
        <div className="drop-zone__actions">
          <img
            src={checkBtn}
            onClick={() => {
              playClick(); // NEW: arcade confirm before logic runs
              onCheck();
            }}
            style={{ cursor: "pointer" }}
          />
          <img
            src={resetBtn}
            onClick={() => {
              playResetSoft(); // NEW: soft optional reset cue
              onReset();
            }}
            style={{ cursor: "pointer" }}
          />
        </div>
      )}
    </section>
  );
}
