import { useEffect } from "react";
import "./Modal.css";

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  actions,
  maxWidth = 900,
  scrollable = false,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-shell" onClick={onClose} role="presentation">
      <div
        className={`modal-shell__dialog${scrollable ? " modal-shell__dialog--scrollable" : ""}`}
        style={{ maxWidth }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Modal"}
      >
        {title ? <h3 className="modal-shell__title">{title}</h3> : null}
        <div className="modal-shell__body">{children}</div>
        {actions ? <div className="modal-shell__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
