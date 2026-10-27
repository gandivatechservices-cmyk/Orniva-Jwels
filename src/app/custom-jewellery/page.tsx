"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
import { IMAGES } from "../../constants/images";
import { customJewelleryService, type CustomJewelleryResponse } from "../../utility/services/customJewellery";
import {
  WORLDWIDE_COUNTRIES,
  POPULAR_COUNTRIES,
  getCountryByCode,
} from "../../utility/countries";
import {
  SparklesIcon,
  ShieldCheckIcon,
  TruckIcon,
  LockIcon,
  CloseIcon,
  CheckIcon,
  ArrowRightIcon,
} from "../../components/icons";
import styles from "./custom-jewellery.module.css";

// Category options
const CATEGORY_OPTIONS = [
  { id: "Rings", label: "Rings", icon: "💍" },
  { id: "Necklaces", label: "Necklaces", icon: "📿" },
  { id: "Pendants", label: "Pendants", icon: "💎" },
  { id: "Earrings", label: "Earrings", icon: "✨" },
  { id: "Bracelets", label: "Bracelets", icon: "💫" },
  { id: "Bangles", label: "Bangles & Kadas", icon: "🪙" },
  { id: "Bridal Sets", label: "Bridal Sets", icon: "👑" },
  { id: "Other", label: "Bespoke Other", icon: "⚜️" },
];

// Metal options
const METAL_OPTIONS = [
  { id: "18K Yellow Gold", title: "18K Yellow Gold", sub: "Classic warm radiance" },
  { id: "18K White Gold", title: "18K White Gold", sub: "Modern silvery brilliance" },
  { id: "18K Rose Gold", title: "18K Rose Gold", sub: "Romantic blush glow" },
  { id: "22K Royal Gold", title: "22K Royal Yellow Gold", sub: "Traditional Indian richness" },
  { id: "14K Solid Gold", title: "14K Solid Gold", sub: "Durable everyday luxury" },
  { id: "950 Platinum", title: "950 Pure Platinum", sub: "Prestige hypoallergenic heirloom" },
  { id: "Two-Tone Gold", title: "Two-Tone / Multi-Gold", sub: "Artisanal contrasting metals" },
];

// Diamond and Gemstone types
const DIAMOND_OPTIONS = [
  { id: "Natural Diamond", label: "Natural Certified Diamond (GIA/IGI Earth-Mined)" },
  { id: "Lab-Grown Diamond", label: "Lab-Grown Certified Diamond (High Purity & Sustainable)" },
  { id: "Colored Gemstones", label: "Precious Gemstones (Emerald, Sapphire, Ruby)" },
  { id: "Moissanite", label: "Moissanite & Diamond Simulants" },
  { id: "No Stones", label: "Plain Metal Only (No Diamonds / Stones)" },
];

// Diamond shapes/cuts
const DIAMOND_SHAPES = [
  "Round Brilliant",
  "Princess",
  "Cushion",
  "Oval",
  "Emerald Cut",
  "Pear",
  "Radiant",
  "Marquise",
  "Heart",
];

// Diamond carat options
const CARAT_OPTIONS = [
  "0.50 – 0.75 ct",
  "0.75 – 1.00 ct",
  "1.00 – 1.50 ct",
  "1.50 – 2.00 ct",
  "2.00 – 3.00 ct",
  "3.00+ ct (Statement)",
  "Flexible / Advise Me",
];

// Budget ranges
const BUDGET_OPTIONS = [
  "Under £1,500 (~₹1,50,000)",
  "£1,500 – £3,000 (~₹1,50,000 - ₹3,00,000)",
  "£3,000 – £6,000 (~₹3,00,000 - ₹6,00,000)",
  "£6,000 – £12,000 (~₹6,00,000 - ₹12,00,000)",
  "£12,000+ (High Jewellery Commission)",
  "Flexible / Price on Design",
];

// Timeline options
const TIMELINE_OPTIONS = [
  "Ready in 2–3 Weeks (Express Atelier)",
  "1 Month",
  "2–3 Months",
  "Flexible / Upcoming Special Occasion",
];

// Preferred consultation channels
const CONSULTATION_METHODS = [
  "WhatsApp Chat Consultation",
  "Phone Call with Master Jeweler",
  "1-on-1 Video Consultation (Google Meet)",
  "Private Flagship Atelier Visit",
];


interface UploadedImage {
  id: string;
  name: string;
  size: string;
  dataUrl: string;
}

export default function CustomJewelleryPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [submissionResult, setSubmissionResult] = useState<CustomJewelleryResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formik & Yup validation schema
  const formik = useFormik({
    initialValues: {
      category: "Rings",
      metal: "18K Yellow Gold",
      diamondType: "Natural Diamond",
      diamondShape: "Round Brilliant",
      diamondCarat: "1.00 – 1.50 ct",
      size: "UK M (US 6.25)",
      budgetRange: "£1,500 – £3,000 (~₹1,50,000 - ₹3,00,000)",
      targetTimeline: "1 Month",
      customMessage: "",
      engravingText: "",
      fullName: "",
      email: "",
      selectedCountry: "GB",
      countryDialCode: "+44",
      phoneNumber: "",
      preferredContactMethod: "WhatsApp Chat Consultation",
    },
    validationSchema: Yup.object({
      category: Yup.string().required("Please select a jewellery category"),
      metal: Yup.string().required("Please select your preferred metal"),
      diamondType: Yup.string().required("Please select your diamond or gemstone choice"),
      size: Yup.string().required("Please specify your desired size or dimensions"),
      customMessage: Yup.string()
        .required("Please describe your custom jewellery design")
        .min(15, "Please provide at least 15 characters describing your design"),
      budgetRange: Yup.string().required("Please select an estimated budget range"),
      targetTimeline: Yup.string().required("Please select an estimated timeline"),
      fullName: Yup.string().required("Full name is required").min(2, "Name is too short"),
      email: Yup.string().required("Email address is required").email("Please enter a valid email"),
      phoneNumber: Yup.string()
        .required("Phone number is required")
        .min(6, "Please enter at least 6 digits")
        .matches(/^[0-9\s\-]+$/, "Please enter digits only"),
      preferredContactMethod: Yup.string().required("Please select your preferred consultation method"),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const imagePayload = uploadedImages.map((img) => img.dataUrl);
        const fullPhone = `${values.countryDialCode} ${values.phoneNumber.trim()}`;
        const res = await customJewelleryService.submitRequest({
          ...values,
          phone: fullPhone,
          referenceImages: imagePayload,
        });
        setSubmissionResult(res);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("Submission failed:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Multiple image upload handler
  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - uploadedImages.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;
        setUploadedImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <StoreLayout>
      <div className={styles.pageWrapper}>
        <TopContentCard
          eyebrow="BESPOKE ATELIER COMMISSIONS"
          title="Custom Jewellery Design Studio"
          subtitle="Collaborate with our master artisans to bring your dream piece to life. Choose your precious metal, certified diamond, sizing, and upload design sketches."
          image={IMAGES.jewelry.customPromo}
          imageAlt="Master jeweler handcrafting custom jewellery in atelier"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Custom Jewellery" },
          ]}
          badge={<span className={styles.atelierBadge}>Artisanal Bespoke Service</span>}
          ariaLabel="Custom Jewellery Design Studio"
        />

        <Container>
          {submissionResult ? (
            /* SUCCESS CONFIRMATION RECEIPT */
            <div className={styles.successCard}>
              <div className={styles.successIconBadge}>
                <CheckIcon size={36} />
              </div>
              <h2 className={styles.successTitle}>Bespoke Commission Received</h2>
              <p className={styles.successSubtitle}>
                Thank you, <strong>{submissionResult.details.fullName}</strong>. Your custom {submissionResult.details.category.toLowerCase()} design specifications have been assigned to our master jeweler.
              </p>

              <div className={styles.refNumberBox}>
                <span className={styles.refLabel}>Consultation Reference</span>
                <span className={styles.refValue}>{submissionResult.referenceNumber}</span>
              </div>

              {/* ROADMAP STEPS */}
              <div className={styles.roadmapSteps}>
                <div className={styles.roadmapStep}>
                  <div className={styles.roadmapStepNum}>Step 01</div>
                  <div className={styles.roadmapStepTitle}>Jeweler Review</div>
                  <div className={styles.roadmapStepDesc}>Our senior designer reviews your reference sketches and reaches out via {(submissionResult.details.preferredContactMethod || "contact").split(" ")[0]}.</div>
                </div>

                <div className={styles.roadmapStep}>
                  <div className={styles.roadmapStepNum}>Step 02</div>
                  <div className={styles.roadmapStepTitle}>3D CAD Renderings</div>
                  <div className={styles.roadmapStepDesc}>We generate photorealistic 3D renders with exact millimeter proportions for your review.</div>
                </div>

                <div className={styles.roadmapStep}>
                  <div className={styles.roadmapStepNum}>Step 03</div>
                  <div className={styles.roadmapStepTitle}>Artisanal Crafting</div>
                  <div className={styles.roadmapStepDesc}>Handcrafted by master goldsmiths in {submissionResult.details.metal} with certified gems.</div>
                </div>

                <div className={styles.roadmapStep}>
                  <div className={styles.roadmapStepNum}>Step 04</div>
                  <div className={styles.roadmapStepTitle}>Insured Delivery</div>
                  <div className={styles.roadmapStepDesc}>Hallmarked, certified with GIA/IGI papers, and safely delivered in luxury velvet packaging.</div>
                </div>
              </div>

              <div className={styles.successActions}>
                <Link href="/" className={styles.primaryActionBtn}>
                  Return to Home
                </Link>
                <Link href="/products" className={styles.secondaryActionBtn}>
                  Explore Ready Collections
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionResult(null);
                    setUploadedImages([]);
                    formik.resetForm();
                  }}
                  className={styles.secondaryActionBtn}
                >
                  Submit Another Design
                </button>
              </div>
            </div>
          ) : (
            /* DESIGN FORM & SIDEBAR */
            <div className={styles.contentGrid}>
              {/* LEFT: BESPOKE REQUEST FORM */}
              <form onSubmit={formik.handleSubmit} className={styles.formContainer} noValidate>
                {/* 1. CATEGORY SELECTION */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>1</span>
                    <h2 className={styles.sectionTitle}>Jewellery Category</h2>
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Select the type of jewellery piece you wish to commission.
                  </p>

                  <div className={styles.cardsGrid}>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <div
                        key={cat.id}
                        className={`${styles.categoryCard} ${
                          formik.values.category === cat.id ? styles.categoryCardActive : ""
                        }`}
                        onClick={() => formik.setFieldValue("category", cat.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            formik.setFieldValue("category", cat.id);
                          }
                        }}
                      >
                        <span className={styles.cardIcon}>{cat.icon}</span>
                        <span className={styles.cardLabel}>{cat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. METAL & PURITY */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>2</span>
                    <h2 className={styles.sectionTitle}>Precious Metal & Purity</h2>
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Select your preferred metal alloy and finish for the setting.
                  </p>

                  <div className={styles.optionsGrid}>
                    {METAL_OPTIONS.map((metal) => (
                      <div
                        key={metal.id}
                        className={`${styles.optionPill} ${
                          formik.values.metal === metal.id ? styles.optionPillActive : ""
                        }`}
                        onClick={() => formik.setFieldValue("metal", metal.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            formik.setFieldValue("metal", metal.id);
                          }
                        }}
                      >
                        <div>
                          <div className={styles.optionTitle}>{metal.title}</div>
                          <div className={styles.optionSub}>{metal.sub}</div>
                        </div>
                        <div className={styles.optionRadio}>
                          {formik.values.metal === metal.id && <div className={styles.optionRadioInner} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. DIAMOND & GEMSTONE SPECIFICATIONS */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>3</span>
                    <h2 className={styles.sectionTitle}>Diamond & Gemstone Choice</h2>
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Specify your stone preference, preferred shape, and carat weight.
                  </p>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Stone Type <span className={styles.requiredStar}>*</span></label>
                    <div className={styles.chipsRow}>
                      {DIAMOND_OPTIONS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          className={`${styles.chip} ${
                            formik.values.diamondType === d.id ? styles.chipActive : ""
                          }`}
                          onClick={() => formik.setFieldValue("diamondType", d.id)}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formik.values.diamondType !== "No Stones" && (
                    <>
                      <div className={styles.formGroup} style={{ marginTop: "16px" }}>
                        <label className={styles.label}>Preferred Diamond Cut / Shape</label>
                        <div className={styles.chipsRow}>
                          {DIAMOND_SHAPES.map((shape) => (
                            <button
                              key={shape}
                              type="button"
                              className={`${styles.chip} ${
                                formik.values.diamondShape === shape ? styles.chipActive : ""
                              }`}
                              onClick={() => formik.setFieldValue("diamondShape", shape)}
                            >
                              {shape}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.formGroup} style={{ marginTop: "16px" }}>
                        <label className={styles.label}>Target Carat Weight</label>
                        <div className={styles.chipsRow}>
                          {CARAT_OPTIONS.map((carat) => (
                            <button
                              key={carat}
                              type="button"
                              className={`${styles.chip} ${
                                formik.values.diamondCarat === carat ? styles.chipActive : ""
                              }`}
                              onClick={() => formik.setFieldValue("diamondCarat", carat)}
                            >
                              {carat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 4. SIZING & DIMENSIONS */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>4</span>
                    <h2 className={styles.sectionTitle}>Size & Dimensions</h2>
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Enter your ring size, chain length, or wrist dimensions. If uncertain, you may request our complimentary sizing kit.
                  </p>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span>Size Specification <span className={styles.requiredStar}>*</span></span>
                      <span className={styles.optionalTag}>Ring size, length in inches, or mm</span>
                    </label>
                    <input
                      type="text"
                      name="size"
                      className={styles.input}
                      placeholder={
                        formik.values.category === "Rings"
                          ? "e.g. UK M (US 6.25) or 'Need complimentary ring sizer'"
                          : formik.values.category === "Necklaces"
                          ? "e.g. 18 inches (Princess length) or 45 cm"
                          : formik.values.category === "Bangles"
                          ? "e.g. Size 2.6 or 2.375 inches diameter"
                          : "e.g. Standard 7 inches or specific measurements"
                      }
                      value={formik.values.size}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.size && formik.errors.size && (
                      <span className={styles.fieldError}>{formik.errors.size}</span>
                    )}
                  </div>
                </div>

                {/* 5. MULTIPLE REFERENCE IMAGES */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>5</span>
                    <h2 className={styles.sectionTitle}>Reference Images & Sketches</h2>
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Upload design sketches, heirloom photos, or inspiration pictures to help our master jewelers visualize your dream piece.
                  </p>

                  <div className={styles.uploadDropzone}>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      multiple
                      className={styles.fileInputHidden}
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={uploadedImages.length >= 5}
                    />
                    <div className={styles.uploadIconWrap}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <p className={styles.uploadPromptText}>
                      Click or drag &amp; drop reference images here
                    </p>
                    <p className={styles.uploadPromptSub}>
                      PNG, JPG or WEBP &bull; Max 5 images &bull; Up to 10MB each
                    </p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <>
                      <span className={styles.imageCountBadge}>
                        {uploadedImages.length} of 5 reference images attached
                      </span>
                      <div className={styles.previewGrid}>
                        {uploadedImages.map((img) => (
                          <div key={img.id} className={styles.previewCard} title={img.name}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.dataUrl} alt={img.name} className={styles.previewImg} />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className={styles.removeImgBtn}
                              aria-label={`Remove image ${img.name}`}
                            >
                              <CloseIcon size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 6. CUSTOM MESSAGE & ENGRAVING */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>6</span>
                    <h2 className={styles.sectionTitle}>Custom Message &amp; Atelier Notes</h2>
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Describe your bespoke vision in detail, including motif styling, claw setting preferences, or sentimental backstory.
                  </p>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span>Design Description &amp; Custom Message <span className={styles.requiredStar}>*</span></span>
                      <span className={styles.optionalTag}>Min 15 characters</span>
                    </label>
                    <textarea
                      name="customMessage"
                      rows={4}
                      className={styles.textarea}
                      placeholder="Describe your dream piece: e.g. A vintage-inspired oval solitaire with micro-pavé hidden halo in 18K yellow gold, delicate split shank, claw prongs..."
                      value={formik.values.customMessage}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.customMessage && formik.errors.customMessage && (
                      <span className={styles.fieldError}>{formik.errors.customMessage}</span>
                    )}
                  </div>

                  <div className={styles.formGroup} style={{ marginTop: "16px" }}>
                    <label className={styles.label}>
                      <span>Complimentary Laser Engraving</span>
                      <span className={styles.optionalTag}>Optional (inside band or back of pendant)</span>
                    </label>
                    <input
                      type="text"
                      name="engravingText"
                      className={styles.input}
                      placeholder="e.g. 'Forever & Always 14.02.2026' or initials 'E & R'"
                      maxLength={50}
                      value={formik.values.engravingText}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                </div>

                {/* 7. BUDGET & TIMELINE */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>7</span>
                    <h2 className={styles.sectionTitle}>Budget &amp; Target Timeline</h2>
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Helps our master jewelers propose the ideal diamond color/clarity tier and metal weight for your budget.
                  </p>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Estimated Budget <span className={styles.requiredStar}>*</span></label>
                      <select
                        name="budgetRange"
                        className={styles.select}
                        value={formik.values.budgetRange}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        {BUDGET_OPTIONS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Desired Timeline <span className={styles.requiredStar}>*</span></label>
                      <select
                        name="targetTimeline"
                        className={styles.select}
                        value={formik.values.targetTimeline}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        {TIMELINE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 8. CONTACT & CONSULTATION */}
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.stepNumber}>8</span>
                    <h2 className={styles.sectionTitle}>Guest Details &amp; Consultation Mode</h2>
                  </div>
                  <p className={styles.sectionSubtitle}>
                    Our Senior Gemologist Concierge will personally review your request and connect with you.
                  </p>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name <span className={styles.requiredStar}>*</span></label>
                    <input
                      type="text"
                      name="fullName"
                      className={styles.input}
                      placeholder="e.g. Eleanor Vance"
                      value={formik.values.fullName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.fullName && formik.errors.fullName && (
                      <span className={styles.fieldError}>{formik.errors.fullName}</span>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Email Address <span className={styles.requiredStar}>*</span></label>
                      <input
                        type="email"
                        name="email"
                        className={styles.input}
                        placeholder="e.g. eleanor@example.com"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <span className={styles.fieldError}>{formik.errors.email}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        <span>Phone / WhatsApp <span className={styles.requiredStar}>*</span></span>
                        <span className={styles.optionalTag}>For design updates</span>
                      </label>
                      <div className={styles.phoneControlGroup}>
                        <select
                          name="selectedCountry"
                          className={styles.select}
                          value={formik.values.selectedCountry}
                          onChange={(e) => {
                            const selected = getCountryByCode(e.target.value);
                            formik.setFieldValue("selectedCountry", e.target.value);
                            if (selected) {
                              formik.setFieldValue("countryDialCode", selected.dialCode);
                            }
                          }}
                        >
                          <optgroup label="Popular Destinations">
                            {POPULAR_COUNTRIES.map((c) => (
                              <option key={`pop-${c.code}`} value={c.code}>
                                {c.flag} {c.name} ({c.dialCode})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="All Countries & Territories (Worldwide)">
                            {WORLDWIDE_COUNTRIES.map((c) => (
                              <option key={`all-${c.code}`} value={c.code}>
                                {c.flag} {c.name} ({c.dialCode})
                              </option>
                            ))}
                          </optgroup>
                        </select>

                        <div className={styles.phoneInputRow}>
                          <span className={styles.dialCodePrefix}>
                            {getCountryByCode(formik.values.selectedCountry).flag}{" "}
                            {formik.values.countryDialCode}
                          </span>
                          <input
                            type="tel"
                            name="phoneNumber"
                            className={styles.phoneNumberField}
                            placeholder={
                              formik.values.selectedCountry === "GB"
                                ? "e.g. 7911 123456"
                                : formik.values.selectedCountry === "IN"
                                ? "e.g. 98765 43210"
                                : formik.values.selectedCountry === "US"
                                ? "e.g. 202 555 0123"
                                : formik.values.selectedCountry === "AE"
                                ? "e.g. 50 123 4567"
                                : formik.values.selectedCountry === "CA"
                                ? "e.g. 416 555 0199"
                                : formik.values.selectedCountry === "AU"
                                ? "e.g. 412 345 678"
                                : "e.g. 123456789"
                            }
                            value={formik.values.phoneNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </div>
                      </div>
                      {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                        <span className={styles.fieldError}>{formik.errors.phoneNumber}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ marginTop: "12px" }}>
                    <label className={styles.label}>Preferred Consultation Channel</label>
                    <select
                      name="preferredContactMethod"
                      className={styles.select}
                      value={formik.values.preferredContactMethod}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {CONSULTATION_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  <SparklesIcon size={18} />
                  <span>{isSubmitting ? "Transmitting to Atelier..." : "Submit Bespoke Commission"}</span>
                </button>
              </form>

              {/* RIGHT: LIVE SUMMARY SIDEBAR */}
              <aside className={styles.summarySidebar} aria-label="Bespoke Commission Summary">
                <h3 className={styles.summaryTitle}>Commission Summary</h3>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Category</span>
                  <span className={`${styles.summaryValue} ${styles.summaryValueHighlight}`}>
                    {formik.values.category}
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Precious Metal</span>
                  <span className={styles.summaryValue}>{formik.values.metal}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Diamond / Stone</span>
                  <span className={styles.summaryValue}>
                    {formik.values.diamondType !== "No Stones"
                      ? `${formik.values.diamondType} (${formik.values.diamondShape})`
                      : "Plain Metal Only"}
                  </span>
                </div>

                {formik.values.diamondType !== "No Stones" && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Carat Range</span>
                    <span className={styles.summaryValue}>{formik.values.diamondCarat}</span>
                  </div>
                )}

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Size</span>
                  <span className={styles.summaryValue}>{formik.values.size || "Pending"}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Sketches / Photos</span>
                  <span className={styles.summaryValue}>
                    {uploadedImages.length > 0 ? `${uploadedImages.length} attached` : "None"}
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Budget Tier</span>
                  <span className={styles.summaryValue}>{formik.values.budgetRange.split(" ")[0]}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Timeline</span>
                  <span className={styles.summaryValue}>{formik.values.targetTimeline}</span>
                </div>

                {/* ATELIER PRIVILEGES */}
                <div className={styles.perksList}>
                  <div className={styles.perkItem}>
                    <ShieldCheckIcon size={18} className={styles.perkIcon} />
                    <span>Complimentary 3D CAD realistic renders before casting.</span>
                  </div>
                  <div className={styles.perkItem}>
                    <SparklesIcon size={18} className={styles.perkIcon} />
                    <span>Certified natural/lab diamonds with GIA or IGI certificates.</span>
                  </div>
                  <div className={styles.perkItem}>
                    <TruckIcon size={18} className={styles.perkIcon} />
                    <span>Discreet, fully insured worldwide door-to-door delivery.</span>
                  </div>
                  <div className={styles.perkItem}>
                    <LockIcon size={18} className={styles.perkIcon} />
                    <span>Lifetime craftsmanship warranty &amp; first complimentary resizing.</span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </div>
    </StoreLayout>
  );
}
