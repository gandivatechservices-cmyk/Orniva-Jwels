"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { App, Button, Form, Input, Popconfirm, Rate, Spin } from "antd";
import {
  CheckCircleFilled,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  LoadingOutlined,
  PictureOutlined,
  StarFilled,
} from "@ant-design/icons";
import { ImageUploadList } from "components";
import { useAuth } from "hooks";
import { reviewsService, getReviewerName, type Review, type ReviewStats } from "utility/services";
import styles from "./ProductReviews.module.css";

const PAGE_SIZE = 10;

const RATING_LABELS: Record<number, string> = {
  1: "1 - Poor",
  2: "2 - Fair",
  3: "3 - Good",
  4: "4 - Very Good",
  5: "5 - Excellent",
};

const AVATAR_COLORS = [
  "#A77B3F",
  "#8E662F",
  "#0369a1",
  "#4338ca",
  "#6d28d9",
  "#b45309",
  "#c2410c",
  "#0f766e",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] || "U").toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function formatDate(isoString: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

export interface ProductReviewsProps {
  productId: string;
  onReviewsChange?: (summary: { average: number; count: number }) => void;
}

export function ProductReviews({ productId, onReviewsChange }: ProductReviewsProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { notification } = App.useApp();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);

  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratingHover, setRatingHover] = useState<number | undefined>(undefined);
  const [currentRating, setCurrentRating] = useState<number>(5);

  // Backend-driven query controls
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  const [form] = Form.useForm();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const currentUserId = user?._id || user?.id || null;

  // Initial / Filter fetch (Page 1 with limit = 10)
  const loadFirstPage = useCallback(() => {
    setLoading(true);
    setPage(1);

    Promise.all([
      reviewsService.list({
        productId,
        page: 1,
        limit: PAGE_SIZE,
        sortBy,
        rating: selectedRatingFilter ?? undefined,
      }),
      isAuthenticated ? reviewsService.listMine() : Promise.resolve([]),
    ])
      .then(([result, mine]) => {
        const fetchedReviews = result.items || [];
        setReviews(fetchedReviews);
        setTotal(result.total || 0);

        if (result.stats) {
          setStats(result.stats);
          onReviewsChange?.({
            average: result.stats.average,
            count: result.stats.count,
          });
        } else {
          const avg =
            fetchedReviews.length > 0
              ? fetchedReviews.reduce((sum, r) => sum + r.rating, 0) / fetchedReviews.length
              : 0;
          onReviewsChange?.({ average: avg, count: result.total || fetchedReviews.length });
        }

        const existing =
          mine.find((review) => {
            const pId =
              typeof review.productId === "object" && review.productId !== null
                ? (review.productId as unknown as { _id: string })._id
                : review.productId;
            return pId === productId;
          }) || null;

        setMyReview(existing);
        if (existing) {
          setImages(existing.images.map((image) => image.url) ?? []);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [productId, sortBy, selectedRatingFilter, isAuthenticated, onReviewsChange]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // Load next page (infinite scroll & button)
  const loadMore = useCallback(() => {
    if (loading || loadingMore || reviews.length >= total) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    reviewsService
      .list({
        productId,
        page: nextPage,
        limit: PAGE_SIZE,
        sortBy,
        rating: selectedRatingFilter ?? undefined,
      })
      .then((result) => {
        const newItems = result.items || [];
        setReviews((prev) => [...prev, ...newItems]);
        setPage(nextPage);
      })
      .catch(() => undefined)
      .finally(() => setLoadingMore(false));
  }, [loading, loadingMore, reviews.length, total, page, productId, sortBy, selectedRatingFilter]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || loadingMore || reviews.length >= total) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "250px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, reviews.length, total, loadMore]);

  // Keep form fields synced only when form is open
  useEffect(() => {
    if (!isFormOpen) return;
    if (myReview) {
      form.setFieldsValue({
        rating: myReview.rating,
        comment: myReview.comment ?? "",
      });
      setCurrentRating(myReview.rating);
      setImages(myReview.images.map((img) => img.url));
    } else {
      form.setFieldsValue({ rating: 5, comment: "" });
      setCurrentRating(5);
      setImages([]);
    }
  }, [myReview, isFormOpen, form]);

  // Overall average rating (prefer stats from backend)
  const averageRating = useMemo(() => {
    if (stats) return stats.average;
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [stats, reviews]);

  const totalReviewsCount = stats ? stats.count : total;

  // Rating breakdown percentages (prefer stats from backend)
  const breakdown = useMemo(() => {
    const counts = stats?.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const countTotal = stats?.count || total || 0;

    return [5, 4, 3, 2, 1].map((star) => {
      const count = counts[star] || 0;
      const percentage = countTotal > 0 ? Math.round((count / countTotal) * 100) : 0;
      return { star, count, percentage };
    });
  }, [stats, total]);

  async function handleSubmit(values: { rating: number; comment?: string }) {
    setSubmitting(true);
    try {
      if (myReview) {
        await reviewsService.update(myReview._id, {
          rating: values.rating,
          comment: values.comment,
          images,
        });
        notification.success({ title: "Review updated successfully!" });
      } else {
        await reviewsService.create({
          productId,
          rating: values.rating,
          comment: values.comment,
          images,
        });
        notification.success({ title: "Thank you! Review submitted successfully." });
      }
      setIsFormOpen(false);
      loadFirstPage();
    } catch (err) {
      notification.error({
        title: "Couldn't save review",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview() {
    if (!myReview) return;
    try {
      await reviewsService.remove(myReview._id);
      notification.success({ title: "Your review was deleted." });
      setMyReview(null);
      setIsFormOpen(false);
      loadFirstPage();
    } catch (err) {
      notification.error({
        title: "Couldn't delete review",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  function handleOpenForm() {
    setIsFormOpen(true);
    if (myReview) {
      setCurrentRating(myReview.rating);
      setImages(myReview.images.map((img) => img.url));
    } else {
      setCurrentRating(5);
      setImages([]);
    }
  }

  return (
    <div className={styles.section} id="product-reviews-section">
      {/* 1. OVERALL SUMMARY HEADER */}
      <div className={styles.summaryCard}>
        {/* Left: Big Score */}
        <div className={styles.scoreBox}>
          <div className={styles.bigScore}>
            <span>{totalReviewsCount > 0 ? averageRating.toFixed(1) : "0.0"}</span>
            <span className={styles.scoreMax}>/ 5</span>
          </div>

          <div className={styles.scoreStars} aria-label={`Average rating: ${averageRating.toFixed(1)} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarFilled
                key={i}
                style={{
                  fontSize: 20,
                  color: i < Math.round(averageRating) ? "#f59e0b" : "#E9E2D8",
                }}
              />
            ))}
          </div>

          <span className={styles.totalReviewsText}>
            {totalReviewsCount > 0
              ? `Based on ${totalReviewsCount} customer ${totalReviewsCount === 1 ? "review" : "reviews"}`
              : "No customer reviews yet"}
          </span>
        </div>

        {/* Center: Rating Breakdown */}
        <div className={styles.breakdownBox}>
          {breakdown.map(({ star, count, percentage }) => {
            const isFilterActive = selectedRatingFilter === star;
            return (
              <div
                key={star}
                className={`${styles.breakdownRow} ${isFilterActive ? styles.activeFilter : ""}`}
                onClick={() => {
                  setSelectedRatingFilter(isFilterActive ? null : star);
                }}
                title={isFilterActive ? "Click to clear filter" : `Filter by ${star} star reviews`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedRatingFilter(isFilterActive ? null : star);
                  }
                }}
              >
                <span className={styles.starLabel}>
                  {star} <StarFilled style={{ fontSize: 13, color: "#f59e0b" }} />
                </span>
                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressFill} ${percentage > 50 ? styles.progressFillGreen : ""}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className={styles.breakdownCount}>
                  {count} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Write Review CTA */}
        <div className={styles.actionBox}>
          <h4 className={styles.actionTitle}>
            {myReview ? "Your Product Feedback" : "Share Your Thoughts"}
          </h4>
          <p className={styles.actionDesc}>
            {myReview
              ? "You have already reviewed this item. You can edit or update your feedback at any time."
              : "Purchased or tried this product? Help other customers choose with your feedback."}
          </p>

          {isAuthenticated ? (
            <button
              type="button"
              className={`${styles.ctaButton} ${myReview ? styles.ctaButtonOutline : ""}`}
              onClick={handleOpenForm}
            >
              <EditOutlined />
              <span>{myReview ? "Edit Your Review" : "Write a Review"}</span>
            </button>
          ) : (
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname || "")}`}
              className={styles.ctaButton}
            >
              Sign In to Review
            </Link>
          )}
        </div>
      </div>

      {/* 2. WRITE / EDIT REVIEW FORM (COLLAPSIBLE) */}
      {isFormOpen && isAuthenticated && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>
              {myReview ? "Edit Your Review" : "Write a Product Review"}
            </h3>
            <button
              type="button"
              className={styles.closeFormBtn}
              onClick={() => setIsFormOpen(false)}
              aria-label="Close review form"
            >
              <CloseOutlined />
            </button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{
              rating: myReview?.rating ?? 5,
              comment: myReview?.comment ?? "",
            }}
          >
            <Form.Item
              name="rating"
              label={
                <span className={styles.ratingSelectLabel}>Overall Rating</span>
              }
              rules={[{ required: true, message: "Please select a rating" }]}
            >
              <div className={styles.ratingSelectGroup}>
                <div className={styles.ratingStarsPicker}>
                  <Rate
                    value={currentRating}
                    onChange={(val) => {
                      setCurrentRating(val);
                      form.setFieldValue("rating", val);
                    }}
                    onHoverChange={setRatingHover}
                    style={{ fontSize: 26, color: "#f59e0b" }}
                  />
                  <span className={styles.ratingTextHint}>
                    {RATING_LABELS[ratingHover || currentRating || 5]}
                  </span>
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="comment"
              label={
                <span className={styles.ratingSelectLabel}>Your Review</span>
              }
              rules={[
                {
                  required: true,
                  message: "Please write a few words about your experience",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="What did you like or dislike? How was the flavor, freshness, and packaging? Would you recommend it to others?"
                maxLength={2000}
                showCount
                style={{ borderRadius: 10, padding: 12 }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className={styles.ratingSelectLabel}>
                  <PictureOutlined style={{ marginRight: 6 }} />
                  Add Photos (Optional)
                </span>
              }
            >
              <ImageUploadList
                value={images}
                onChange={setImages}
                folder="reviews"
                maxCount={5}
                onUploadingChange={setUploadingPhotos}
              />
            </Form.Item>

            <div className={styles.formActionRow}>
              {myReview && (
                <Popconfirm
                  title="Delete your review?"
                  description="Are you sure you want to remove your review for this product?"
                  okText="Yes, delete"
                  cancelText="Cancel"
                  okType="danger"
                  onConfirm={handleDeleteReview}
                >
                  <Button danger type="text" icon={<DeleteOutlined />}>
                    Delete Review
                  </Button>
                </Popconfirm>
              )}

              <Button onClick={() => setIsFormOpen(false)}>Cancel</Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting || uploadingPhotos}
                disabled={uploadingPhotos}
                style={{
                  backgroundColor: "#A77B3F",
                  borderColor: "#A77B3F",
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 38,
                  padding: "0 24px",
                }}
              >
                {myReview ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* 3. TOOLBAR: BACKEND FILTERS & BACKEND SORTING */}
      {totalReviewsCount > 0 && (
        <div className={styles.toolbar}>
          <div className={styles.filterChips} role="group" aria-label="Filter reviews by star rating">
            <button
              type="button"
              className={`${styles.filterChip} ${selectedRatingFilter === null ? styles.activeChip : ""}`}
              onClick={() => setSelectedRatingFilter(null)}
            >
              All ({totalReviewsCount})
            </button>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats?.breakdown?.[star] ?? 0;
              if (count === 0) return null;
              return (
                <button
                  key={star}
                  type="button"
                  className={`${styles.filterChip} ${selectedRatingFilter === star ? styles.activeChip : ""}`}
                  onClick={() =>
                    setSelectedRatingFilter(selectedRatingFilter === star ? null : star)
                  }
                >
                  {star} ★ ({count})
                </button>
              );
            })}
          </div>

          <div className={styles.sortGroup}>
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "highest" | "lowest")
              }
              className={styles.sortSelect}
              aria-label="Sort reviews"
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. REVIEWS LIST OR EMPTY STATE */}
      {loading ? (
        <div style={{ display: "grid", placeItems: "center", padding: "48px 0" }}>
          <Spin size="large" />
        </div>
      ) : totalReviewsCount === 0 ? (
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyIconCircle}>
            <StarFilled style={{ fontSize: 26 }} />
          </div>
          <h3 className={styles.emptyTitle}>No reviews yet for this product</h3>
          <p className={styles.emptySubtitle}>
            Be the first customer to review this product and share your culinary experience with the community!
          </p>
          {isAuthenticated ? (
            <button
              type="button"
              className={styles.ctaButton}
              onClick={handleOpenForm}
            >
              <EditOutlined />
              <span>Write the First Review</span>
            </button>
          ) : (
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname || "")}`}
              className={styles.ctaButton}
            >
              Sign In to Write a Review
            </Link>
          )}
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.emptyStateCard}>
          <h3 className={styles.emptyTitle}>No matching reviews</h3>
          <p className={styles.emptySubtitle}>
            There are no {selectedRatingFilter}-star reviews for this product.
          </p>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={() => setSelectedRatingFilter(null)}
          >
            Show All Reviews
          </button>
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map((review) => {
            const reviewerName = getReviewerName(review);
            const reviewerInitials = getInitials(reviewerName);
            const avatarBg = getAvatarColor(reviewerName);
            const visibleImages = (review.images || []).filter(
              (img) => img.isActive !== false
            );
            const reviewUserId =
              typeof review.userId === "object" && review.userId !== null
                ? review.userId._id
                : review.userId;
            const isMine = currentUserId && reviewUserId === currentUserId;

            return (
              <article key={review._id} className={styles.reviewCard}>
                <div className={styles.reviewCardHeader}>
                  <div className={styles.reviewerProfile}>
                    <div
                      className={styles.avatarCircle}
                      style={{ backgroundColor: avatarBg }}
                      aria-hidden="true"
                    >
                      {reviewerInitials}
                    </div>

                    <div className={styles.reviewerMeta}>
                      <div className={styles.reviewerNameRow}>
                        <span className={styles.reviewerName}>{reviewerName}</span>
                        {/* ONLY SHOW VERIFIED BUYER IF USER ACTUALLY BOUGHT THE PRODUCT */}
                        {review.isVerifiedBuyer && (
                          <span className={styles.verifiedBadge}>
                            <CheckCircleFilled style={{ fontSize: 10 }} />
                            Verified Buyer
                          </span>
                        )}
                        {isMine && (
                          <span className={styles.yourReviewBadge}>
                            Your Review
                          </span>
                        )}
                      </div>
                      <span className={styles.reviewDate}>
                        Reviewed on {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.reviewHeaderRight}>
                    <div
                      className={styles.starsRow}
                      aria-label={`Rated ${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarFilled
                          key={i}
                          style={{
                            fontSize: 16,
                            color: i < review.rating ? "#f59e0b" : "#E9E2D8",
                          }}
                        />
                      ))}
                    </div>

                    {isMine && (
                      <div className={styles.reviewActions}>
                        <button
                          type="button"
                          className={styles.textActionBtn}
                          onClick={handleOpenForm}
                          title="Edit your review"
                        >
                          <EditOutlined style={{ marginRight: 4 }} />
                          Edit
                        </button>
                        <Popconfirm
                          title="Delete your review?"
                          description="Are you sure you want to remove your review?"
                          okText="Delete"
                          cancelText="Cancel"
                          okType="danger"
                          onConfirm={handleDeleteReview}
                        >
                          <button
                            type="button"
                            className={`${styles.textActionBtn} ${styles.textActionBtnDanger}`}
                            title="Delete your review"
                          >
                            <DeleteOutlined style={{ marginRight: 4 }} />
                            Delete
                          </button>
                        </Popconfirm>
                      </div>
                    )}
                  </div>
                </div>

                {review.comment && (
                  <p className={styles.reviewComment}>{review.comment}</p>
                )}

                {visibleImages.length > 0 && (
                  <div className={styles.reviewImagesGrid}>
                    {visibleImages.map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img._id}
                        src={img.url}
                        alt="Customer review photo"
                        className={styles.reviewImageThumb}
                        onClick={() => setLightboxImageUrl(img.url)}
                      />
                    ))}
                  </div>
                )}
              </article>
            );
          })}

          {/* INFINITE SCROLL SENTINEL & LOAD MORE AREA */}
          <div className={styles.paginationArea}>
            <div ref={sentinelRef} style={{ height: 1, width: "100%" }} />

            {loadingMore && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#A77B3F", fontWeight: 600 }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 18 }} spin />} />
                <span>Loading more reviews…</span>
              </div>
            )}

            {!loadingMore && reviews.length < total && (
              <button
                type="button"
                className={styles.loadMoreBtn}
                onClick={loadMore}
                disabled={loadingMore}
              >
                <span>Load More Reviews ({total - reviews.length} remaining)</span>
                <DownOutlined style={{ fontSize: 12 }} />
              </button>
            )}

            {!loadingMore && reviews.length >= total && total > PAGE_SIZE && (
              <span className={styles.allLoadedText}>
                You have viewed all {total} reviews.
              </span>
            )}
          </div>
        </div>
      )}

      {/* 5. LIGHTBOX MODAL FOR REVIEW PHOTOS */}
      {lightboxImageUrl && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxImageUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setLightboxImageUrl(null)}
              aria-label="Close photo preview"
            >
              <CloseOutlined />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImageUrl}
              alt="Enlarged review photo"
              className={styles.lightboxImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
