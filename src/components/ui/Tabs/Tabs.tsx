import { useState, useRef, type KeyboardEvent } from "react";
import type { TabsProps } from "./types";
import styles from "./Tabs.module.css";

export function Tabs({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  className = "",
}: TabsProps) {
  const [internalKey, setInternalKey] = useState<string>(
    defaultActiveKey || items[0]?.key || ""
  );

  const currentKey = activeKey !== undefined ? activeKey : internalKey;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    if (activeKey === undefined) {
      setInternalKey(key);
    }
    onChange?.(key);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const enabledIndices = items
      .map((item, idx) => (!item.disabled ? idx : -1))
      .filter((idx) => idx !== -1);

    const currentPos = enabledIndices.indexOf(currentIndex);
    let nextIndex = -1;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        nextIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
        break;
      case "ArrowLeft":
        e.preventDefault();
        nextIndex = enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
        break;
      case "Home":
        e.preventDefault();
        nextIndex = enabledIndices[0];
        break;
      case "End":
        e.preventDefault();
        nextIndex = enabledIndices[enabledIndices.length - 1];
        break;
    }

    if (nextIndex !== -1 && tabRefs.current[nextIndex]) {
      tabRefs.current[nextIndex]?.focus();
      handleTabClick(items[nextIndex].key, items[nextIndex].disabled);
    }
  };

  const activeTab = items.find((item) => item.key === currentKey) || items[0];

  return (
    <div className={`${styles.tabsContainer} ${className}`}>
      <div role="tablist" className={styles.tabList} aria-orientation="horizontal">
        {items.map((item, index) => {
          const isActive = item.key === currentKey;
          return (
            <button
              key={item.key}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              id={`tab-${item.key}`}
              aria-controls={`tabpanel-${item.key}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => handleTabClick(item.key, item.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                ${styles.tabButton}
                ${isActive ? styles.activeTab : ""}
                ${item.disabled ? styles.disabledTab : ""}
              `}
            >
              {item.label}
              {isActive && <span className={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>

      {activeTab && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab.key}`}
          aria-labelledby={`tab-${activeTab.key}`}
          className={styles.tabPanel}
          tabIndex={0}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
