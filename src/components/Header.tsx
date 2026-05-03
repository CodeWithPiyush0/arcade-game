import smallBox from "../assets/Small_box.svg";

type HeaderProps = {
  target: number;
  total: number;
  status: "idle" | "correct" | "wrong"; // NEW
};

const RUPEE = "\u20B9";

export default function Header({ target, total, status }: HeaderProps) {
    
    const message =
    status === "correct"
      ? "Yay! You have won the tickets!"
      : status === "wrong"
      ? "Oops! Try again"
      : `Use coins or notes to make ₹${target}`;

  return (
    <div className="game-header">
      <div className="header-box header-box--small text-center">
        <img alt="" aria-hidden="true" className="header-box__frame" src={smallBox} />
        <p className="header-box__label">
          TARGET
        </p>
        <p className="header-box__amount">
          {RUPEE}
          {target}
        </p>
      </div>

      <div className="header-box header-box--big header-box--custom">
        <p className="header-box__prompt">
            {message}
        </p>
      </div>

      <div className="header-box header-box--small text-center">
        <img alt="" aria-hidden="true" className="header-box__frame" src={smallBox} />
        <p className="header-box__label">
          TOTAL
        </p>
        <p className="header-box__amount">
          {RUPEE}
          {total}
        </p>
      </div>
    </div>
  );
}
