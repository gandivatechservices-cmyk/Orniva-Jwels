import { useState } from "react";
import { ChevronDownIcon } from "components/icons";
import type { AccordionProps } from "./types";
import styles from "./Accordion.module.css";

export function Accordion({ items, allowMultiple = true, className = "" }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(() =>
    items.filter((item) => item.defaultOpen !== false).map((item) => item.id)
  );

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`${styles.accordion} ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const headerId = `accordion-header-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className={styles.item}>
            <button
              type="button"
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleItem(item.id)}
              className={styles.trigger}
            >
              <span className={styles.title}>{item.title}</span>
              <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
                <ChevronDownIcon size={16} />
              </span>
            </button>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className={styles.content}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
