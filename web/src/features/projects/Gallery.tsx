import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { Project } from './schema';

export function Gallery({
  screenshots,
  columns,
}: {
  screenshots: Project['screenshots'];
  columns: number;
}) {
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const screenshotCount = screenshots.length;

  const showNextScreenshot = useCallback(() => {
    setSelectedScreenshotIndex((currentIndex) => (currentIndex + 1) % screenshotCount);
  }, [screenshotCount]);

  const showPreviousScreenshot = useCallback(() => {
    setSelectedScreenshotIndex(
      (currentIndex) => (currentIndex - 1 + screenshotCount) % screenshotCount,
    );
  }, [screenshotCount]);

  function openScreenshot(screenshotIndex: number) {
    setSelectedScreenshotIndex(screenshotIndex);
    dialogRef.current?.showModal();
  }

  function closeScreenshot() {
    dialogRef.current?.close();
  }

  function closeOnBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeScreenshot();
  }

  useEffect(() => {
    const handleGalleryKey = (event: KeyboardEvent) => {
      if (!dialogRef.current?.open) return;
      const actions: Record<string, () => void> = {
        ArrowRight: showNextScreenshot,
        ArrowLeft: showPreviousScreenshot,
      };
      actions[event.key]?.();
    };
    document.addEventListener('keydown', handleGalleryKey);
    return () => document.removeEventListener('keydown', handleGalleryKey);
  }, [showNextScreenshot, showPreviousScreenshot]);
  if (screenshotCount === 0) return null;
  const selectedScreenshot = screenshots[selectedScreenshotIndex];
  return (
    <section className="gallery-section">
      <h2>Screenshots</h2>
      <div className={`gallery gallery-${columns}`}>
        {screenshots.map((screenshot, screenshotIndex) => (
          <figure key={screenshot.path}>
            <button
              className="screenshot-button"
              aria-label={`Enlarge ${screenshot.caption.toLowerCase()} screenshot`}
              onClick={() => openScreenshot(screenshotIndex)}
            >
              <img
                src={screenshot.path}
                alt={screenshot.alt}
                width="1920"
                height="1080"
                loading="lazy"
              />
            </button>
            <figcaption>{screenshot.caption}</figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className="image-dialog"
        aria-label="Project screenshot"
        onClick={closeOnBackdropClick}
      >
        <div className="lightbox-header">
          <p>{selectedScreenshot.caption}</p>
          <button aria-label="Close screenshot" onClick={closeScreenshot}>
            <X size={22} />
          </button>
        </div>
        <img src={selectedScreenshot.path} alt={selectedScreenshot.alt} />
        <div className="lightbox-footer">
          <button aria-label="Previous screenshot" onClick={showPreviousScreenshot}>
            <ArrowLeft size={18} />
            Previous
          </button>
          <span aria-live="polite">
            {selectedScreenshotIndex + 1} / {screenshotCount}
          </span>
          <button aria-label="Next screenshot" onClick={showNextScreenshot}>
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      </dialog>
    </section>
  );
}
