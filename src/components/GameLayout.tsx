import bg from "../assets/BG.png";
import { useEffect, useRef, useState } from "react";
import CoinTray from "../components/CoinTray";
import DropZone from "../components/DropZone";
import Header from "../components/Header";
import { TicketBurstLayer } from "../components/TicketBurstLayer";
import Confetti from "react-confetti";
import { useSound } from "../hooks/useSound";
import { createTicketBursts } from "../lib/ticketBurst";
import type { TicketBurstItem } from "../lib/ticketBurst";

const SUCCESS_SOUND = "/sounds/success1.mp3";
const ERROR_SOUND = "/sounds/error.mp3";

function getAutoResetDelayMs() {
  return 5000;
}

const TICKET_BURST_CLEAR_MS = 4700;
const MIN_TICKET_BURST_COUNT = 80;
const TICKET_BURST_SPREAD_COUNT = 40;

function getTicketBurstCount() {
  return MIN_TICKET_BURST_COUNT + Math.floor(Math.random() * TICKET_BURST_SPREAD_COUNT);
}

/** Dropped tray item shape (matches CoinTray payload) */
type DroppedMoneyItem = {
  type?: string;
  value: number;
  alt?: string;
  className: string;
  src: string;
};

export default function GameLayout() {
  const [total, setTotal] = useState(0);
  const [droppedItems, setDroppedItems] = useState<DroppedMoneyItem[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [wrongFeedbackTick, setWrongFeedbackTick] = useState(0);

  const [ticketBursts, setTicketBursts] = useState<TicketBurstItem[]>([]);
  const ticketBurstClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const target = 25;

  const playSuccess = useSound(SUCCESS_SOUND, 0.64);
  const playError = useSound(ERROR_SOUND, 0.66);

  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (prevStatusRef.current === status) return;
    prevStatusRef.current = status;
    if (status === "correct") playSuccess();
  }, [status, playSuccess]);

  useEffect(
    () => () => {
      if (ticketBurstClearRef.current !== null) {
        window.clearTimeout(ticketBurstClearRef.current);
      }
      if (autoResetRef.current !== null) {
        window.clearTimeout(autoResetRef.current);
      }
    },
    [],
  );

  const clearTicketBurstSchedule = () => {
    if (ticketBurstClearRef.current !== null) {
      window.clearTimeout(ticketBurstClearRef.current);
      ticketBurstClearRef.current = null;
    }
  };

  const clearAutoResetSchedule = () => {
    if (autoResetRef.current !== null) {
      window.clearTimeout(autoResetRef.current);
      autoResetRef.current = null;
    }
  };

  const scheduleAutoReset = () => {
    clearAutoResetSchedule();
    // NEW: kid-friendly auto reset window (5–7 seconds)
    const delayMs = getAutoResetDelayMs();
    autoResetRef.current = window.setTimeout(() => {
      handleReset();
      autoResetRef.current = null;
    }, delayMs);
  };

  const handleDropItem = (item: DroppedMoneyItem) => {
    setDroppedItems((prev) => [...prev, item]);
    setTotal((prev) => prev + item.value);
  };

  const handleCheck = () => {
    if (total === target) {
      clearTicketBurstSchedule();
      setStatus("correct");
      const count = getTicketBurstCount();
      setTicketBursts(createTicketBursts(count));
      ticketBurstClearRef.current = window.setTimeout(() => {
        setTicketBursts([]);
        ticketBurstClearRef.current = null;
      }, TICKET_BURST_CLEAR_MS);
      scheduleAutoReset();
    } else {
      clearTicketBurstSchedule();
      setTicketBursts([]);
      playError(); // NEW: replay on every wrong check press
      setStatus("wrong");
      setWrongFeedbackTick((prev) => prev + 1); // NEW: retrigger shake each time
      scheduleAutoReset();
    }
  };

  const handleReset = () => {
    clearTicketBurstSchedule();
    clearAutoResetSchedule();
    setTicketBursts([]);
    setDroppedItems([]);
    setTotal(0);
    setStatus("idle");
    setWrongFeedbackTick(0);
  };

  const handleUndo = () => {
    if (droppedItems.length === 0) return;
    const lastItem = droppedItems[droppedItems.length - 1];
    setDroppedItems((prev) => prev.slice(0, -1));
    setTotal((prev) => prev - lastItem.value);

    // Clear error state if undoing after a mistake
    if (status === "wrong") {
      setStatus("idle");
      setWrongFeedbackTick(0);
      clearAutoResetSchedule();
    }
  };

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="relative aspect-video h-full max-w-full">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url(${bg})` }}
        />

        <div className="absolute inset-[5%] z-10 flex flex-col gap-6 pt-10">
          <Header target={target} total={total} status={status} />

          <DropZone
            items={droppedItems}
            status={status}
            wrongFeedbackTick={wrongFeedbackTick}
            onCheck={handleCheck}
            onUndo={handleUndo}
            onDropItem={handleDropItem}
          />

          <CoinTray />
        </div>

        <TicketBurstLayer items={ticketBursts} />
        {ticketBursts.length > 0 && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
      </div>
    </div>
  );
}
