import { useEffect, useRef, useState } from "react";
import { useSound } from "../hooks/useSound";
import decorativeElement from "../assets/Decorative_element.svg";
import checkBtn from "../assets/Check_Btn.svg"; // NEW
import undoBtn from "../assets/Undo_btn.svg"; // NEW

const DROP_COIN_SOUND = "/sounds/drop.mp3"; // NEW: coin landed
const DROP_NOTE_SOUND = "/sounds/note.mp3"; // NEW: note landed
const CLICK_SOUND = "/sounds/click.mp3"; // NEW: check button confirm beep

export default function DropZone({
  items,
  status,
  wrongFeedbackTick,
  onDropItem,
  onCheck,
  onUndo,
}: {
  items: { src: string; className: string }[];
  status: string;
  wrongFeedbackTick: number;
  onDropItem: (item: { src: string; className: string; value: number; type?: string; alt?: string }) => void;
  onCheck: () => void;
  onUndo: () => void;
}) {
  const playDropCoin = useSound(DROP_COIN_SOUND, 0.65); // NEW: successful coin drop
  const playDropNote = useSound(DROP_NOTE_SOUND, 0.65); // NEW: successful note drop
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
          const parsed = JSON.parse(data);
          if (parsed.type === "note") {
            playDropNote();
          } else {
            playDropCoin();
          }
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
          <div className="drop-zone__label" style={{ opacity: 0.5 }}>
            <span>DRAG & DROP MONEY HERE</span>
          </div>
        </div>
      )}

      {/* Dropped items only when present — avoids empty spacer shifting the placeholder */}
      {items.length > 0 && (
        <div className="drop-zone__items">
          {(() => {
            // Group identical items by their source image so they can be stacked
            const grouped = items.reduce((acc, item, originalIndex) => {
              let group = acc.find((g) => g.src === item.src);
              if (!group) {
                group = { src: item.src, elements: [] };
                acc.push(group);
              }
              group.elements.push({ item, originalIndex });
              return acc;
            }, [] as { src: string; elements: { item: typeof items[0]; originalIndex: number }[] }[]);

            return grouped.map((group, groupIdx) => (
              <div key={groupIdx} style={{ display: "flex", flexDirection: "row", position: "relative" }}>
                {group.elements.map((el, idx) => (
                  <img
                    key={el.originalIndex}
                    src={el.item.src}
                    className={`${el.item.className} ${bounceIndex === el.originalIndex ? "drop-zone__item--drop-bounce" : ""}`}
                    alt=""
                    style={{
                      marginLeft: idx > 0 ? (el.item.className.includes("note") ? "-80px" : "-35px") : "0px",
                      zIndex: idx,
                      position: "relative"
                    }}
                  />
                ))}
              </div>
            ));
          })()}
        </div>
      )}

      {/* NEW: buttons */}
      {items.length > 0 && (
        <div className="drop-zone__actions">
          <img
            src={checkBtn}
            onClick={() => {
              onCheck();
            }}
            style={{ cursor: "pointer" }}
          />
          <img
            src={undoBtn}
            onClick={() => {
              playResetSoft(); // NEW: soft optional undo cue
              onUndo();
            }}
            style={{ cursor: "pointer" }}
          />
        </div>
      )}
    </section>
  );
}
