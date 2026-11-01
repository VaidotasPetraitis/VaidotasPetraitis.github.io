import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { Project } from './schema';

type GalleryProps = {
  screenshots: Project['screenshots'];
  columns: number;
};

export function Gallery(props: GalleryProps) {
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const screenshotCount = props.screenshots.length;

  function showNextScreenshot() {
    setSelectedScreenshotIndex((currentIndex) => (currentIndex + 1) % screenshotCount);
  }

  function showPreviousScreenshot() {
    setSelectedScreenshotIndex(
      (currentIndex) => (currentIndex - 1 + screenshotCount) % screenshotCount,
    );
  }

  function openScreenshot(screenshotIndex: number) {
    setSelectedScreenshotIndex(screenshotIndex);
    dialogRef.current?.showModal();
  }

  function closeScreenshot() {
    dialogRef.current?.close();
  }

  function closeOnBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeScreenshot();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowRight') {
      showNextScreenshot();
    }

    if (event.key === 'ArrowLeft') {
      showPreviousScreenshot();
    }
  }

  if (screenshotCount === 0) {
    return null;
  }

  const selectedScreenshot = props.screenshots[selectedScreenshotIndex];

  return (
    <section className="gallery-section">
      <h2>Screenshots</h2>
      <div className={`gallery gallery-${props.columns}`}>
        {props.screenshots.map((screenshot, screenshotIndex) => (
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
        onKeyDown={handleKeyDown}
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
