"use client";

import type { ReactElement } from "react";

import Link from "next/link";
import { Modal } from "components/ui/Modal";
import type { SizeGuide } from "constants/sizeGuides";
import { downloadTextFile } from "utility/downloadRingSizeChart";
import styles from "./SizeHelpModal.module.css";

export type SizeHelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  guide: SizeGuide;
};

const NecklaceIcon = () => (
  <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 8c0 14 6 22 16 22S40 22 40 8" />
    <path d="M13 8c1 10 5 16 11 16s10-6 11-16" />
    <polygon points="24,30 28,36 24,44 20,36" />
  </svg>
);

const ICONS: Record<string, () => ReactElement> = { ring: () => <RingIcon />, necklace: () => <NecklaceIcon />, pdf: () => <PdfIcon /> };

const RingIcon = () => (
  <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <ellipse cx="24" cy="30" rx="15" ry="11" />
    <ellipse cx="24" cy="30" rx="11" ry="7.5" />
    <polygon points="18,14 30,14 33,19 24,27 15,19" />
    <path d="M15 19h18M21 14l-2 5 5 8M27 14l2 5-5 8" />
  </svg>
);

const PdfIcon = () => (
  <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5h17l8 8v30H12z" />
    <path d="M29 5v8h8" />
    <text x="24" y="26" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">CSV</text>
    <path d="M24 30v8M20.5 35l3.5 3.5 3.5-3.5" />
  </svg>
);

const ExpertIcon = () => (
  <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="24" cy="30" r="7" />
    <path d="M10 44c1-8 7-11 14-11s13 3 14 11" />
    <polygon points="24,5 26,10 31,10.5 27.3,14 28.3,19 24,16.5 19.7,19 20.7,14 17,10.5 22,10" />
    <path d="M8 12l3 2M40 12l-3 2M6 22h4M38 22h4" />
  </svg>
);

/** "Need Size Help?" dialog. Copy and links come from the guide config in constants/sizeGuides.ts. */
export function SizeHelpModal({ isOpen, onClose, guide }: SizeHelpModalProps) {
  const { title, subtitle, options, expert } = guide.modal;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" className={styles.modal}>
      <div className={styles.content}>
        <h3 className={styles.heading}>{title}</h3>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.options}>
          {options.map((opt, i) => (
            <div key={opt.id} className={styles.option} style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
              <span className={styles.optionIcon}>{(ICONS[opt.icon] ?? ICONS.pdf)()}</span>
              <h4 className={styles.optionTitle}>{opt.title}</h4>
              <p className={styles.optionText}>{opt.text}</p>
              {opt.href ? (
                <Link href={opt.href} className={styles.btn} onClick={onClose}>
                  {opt.cta}
                </Link>
              ) : (
                <button type="button" className={styles.btn} onClick={() => downloadTextFile(guide.csv(), guide.csvFilename)}>
                  {opt.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={styles.expert}>
          <span className={styles.expertIcon}>
            <ExpertIcon />
          </span>
          <div className={styles.expertText}>
            <strong>{expert.title}</strong>
            <span>{expert.text}</span>
          </div>
          <Link href={expert.href} className={styles.expertLink} onClick={onClose}>
            {expert.cta}
          </Link>
        </div>
      </div>
    </Modal>
  );
}
