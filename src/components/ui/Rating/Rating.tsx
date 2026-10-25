import { StarIcon } from "components/icons";
import type { RatingProps } from "./types";
import styles from "./Rating.module.css";

export function Rating({
  score,
  maxScore = 5,
  count,
  showScore = true,
  size = "md",
  className = "",
}: RatingProps) {
  const safeScore = Math.min(Math.max(0, score), maxScore);
  const starSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  return (
    <div
      className={`${styles.ratingWrap} ${styles[size]} ${className}`}
      aria-label={`Rating: ${safeScore} out of ${maxScore} stars${count !== undefined ? `, based on ${count} reviews` : ""}`}
    >
      <div className={styles.starsRow}>
        {Array.from({ length: maxScore }).map((_, i) => {
          const isFilled = i + 1 <= Math.round(safeScore);
          return (
            <span key={i} className={isFilled ? styles.starFilled : styles.starEmpty}>
              <StarIcon size={starSize} filled={isFilled} />
            </span>
          );
        })}
      </div>

      {showScore && <span className={styles.scoreText}>{safeScore.toFixed(1)}</span>}

      {count !== undefined && <span className={styles.countText}>({count})</span>}
    </div>
  );
}
