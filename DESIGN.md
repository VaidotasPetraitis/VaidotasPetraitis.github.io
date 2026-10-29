---
name: Vaidotas Petraitis Portfolio
description: A compact dark portfolio with an IDE-inspired Explorer.
colors:
  background: "#191e26"
  foreground: "#e6eaf0"
  secondary: "#b3bfce"
  muted: "#99a8bb"
  body-copy: "#cbd4e0"
  summary: "#c4cfdd"
  accent: "#54d8ef"
  selected: "#293341"
  hover: "#232b36"
  stroke: "#738397"
  tree-line: "#3c4858"
  folder: "#e4cc52"
  banner: "#1c3049"
  teal: "#287d86"
  cobalt: "#355ca4"
  amber: "#df9b24"
typography:
  headline:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  navigation:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  banner: "3px"
  row: "4px"
  disclosure: "5px"
  node: "8px"
spacing:
  icon: "8px"
  compact: "12px"
  small: "16px"
  medium: "24px"
  section: "32px"
  gutter: "48px"
  desktop-gap: "64px"
components:
  navigation-row:
    textColor: "{colors.foreground}"
    typography: "{typography.navigation}"
    rounded: "{rounded.row}"
    padding: "8px 9px"
  navigation-row-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.accent}"
    rounded: "{rounded.row}"
  navigation-row-hover:
    backgroundColor: "{colors.hover}"
    textColor: "{colors.foreground}"
  diagram-node:
    textColor: "{colors.foreground}"
    rounded: "{rounded.node}"
    padding: "12px 10px"
  text-button:
    textColor: "{colors.accent}"
    padding: "6px 0"
---

# Design System: Vaidotas Petraitis Portfolio

## Overview

**Creative North Star: "The Portfolio Explorer"**

A restrained dark working environment: compact type, quiet navigation and readable engineering evidence. The IDE reference comes from hierarchy, folder outlines and selected rows; the content remains an ordinary website.

This document records the implemented visual system in `web/src/styles.css` and shared React components, including the colored About banner and project diagrams. `PRODUCT.md` describes durable product commitments; `PLAN.md` records page and content decisions.

**Key Characteristics:**
- Dense, readable sans-serif typography.
- Flat charcoal surfaces with rare cyan emphasis.
- Thin outline icons, restrained rounding and explicit diagram captions.
- Original project screenshots and an image-edited portrait derived from the supplied photo.

## Colors

The palette uses cool charcoal neutrals with functional accents. Frontmatter values are normative.

### Primary
- **Cyan accent:** selected navigation, source and verification links, loading indicator and keyboard focus.

### Secondary
- **Folder yellow:** outline folder icons in the Explorer.
- **Banner teal, cobalt and amber:** geometric artwork in the About identity banner.

### Neutral
- **Background and foreground:** page canvas and principal text.
- **Body copy and summary:** long-form content and supporting introductions.
- **Secondary and muted:** metadata, captions and low-priority footer text.
- **Selected and hover:** quiet navigation state surfaces.
- **Stroke and tree line:** diagram outlines and Explorer/timeline connections.
- **Banner navy:** continuous dark support for contact text and portrait composition.

**The Functional Accent Rule.** Keep cyan attached to interaction, selection or status rather than large decorative surfaces.

## Typography

**Body and heading font:** Segoe UI with the system fallbacks above. Implemented metadata uses this same sans-serif family; there is no separate monospace face.

Page titles use the headline role; section headings use title. Experience and credential titles are slightly smaller (18px), becoming (17px) on narrow screens. Header identity is (21px), with a supporting headline (13px). About biography is (15px), with a maximum width (78ch); summaries are (16px/1.6). Other metadata ranges from (11px) to (13px). The Explorer label is uppercase (12px/1.3), with tracking (0.02em).

At (590px) and below, page headings become (24px), summaries (15px), biography (14px) and header identity (18px). Keep this hierarchy compact.

## Layout

The centered site has a maximum border-box width (1536px), desktop horizontal padding (48px), and base top/bottom padding (58px/26px). At (1440px) and above, top padding is (65px). The desktop grid uses an Explorer column (250px), gap (64px), and flexible main column that can shrink to zero. Explorer is sticky (28px from the top). Header identity and contact links share a row.

At (1190px) and below, horizontal padding becomes (32px), Explorer (225px) and grid gap (40px). About columns stack here. At (850px) and below, the shell becomes one column with horizontal padding (24px) and a collapsed **Browse portfolio** disclosure. About returns to two columns in this wider content area, then stacks at (590px). Horizontal padding becomes (20px) at that breakpoint and (16px) at (390px).

Galleries stay in the main column, with maximum width (820px); Quiz's two-column gallery is capped at (760px). Rutuliukai uses three columns on wide desktops, two at (1190px), three again below (850px), and two at (590px). Both galleries become one column at (390px). Images retain their proportions within a (16:9) contained frame. No gallery enters the Explorer column.

## Elevation & Depth

There are no box shadows. Tone, thin borders, connector lines and spacing communicate structure. The gallery dialog uses a dark translucent backdrop (`#090c12e6`) and a restrained border. The About portrait overlaps its banner; clipped colored shapes sit behind it, with contact text above the artwork.

**The Flat Surface Rule.** Use tonal state changes and outlines before introducing elevation.

## Shapes

Rounding is slight: banner, row, disclosure and diagram/dialog radii follow the frontmatter roles. Diagram boxes have thin borders (1px); outline SVG icons retain their stroke character. Banner geometry consists of a teal circle, clipped cobalt chevron and narrow amber accent. Preserve the portrait's aspect ratio: final CSS sets automatic width, applies no transform and anchors it to the banner bottom. The transparent `web/public/images/portrait-banner.png` asset (1561 × 1008) is image-edited from the supplied photo. It already faces left, preserves loose hair edges and uses a broad shoulder crop; do not mirror it again. It is not an unchanged-pixel cutout.

## Components

### Explorer and navigation

Rows combine compact spacing, file/folder icons and nested connector lines. Selected links use the selected surface and cyan text, with `aria-current="page"`. Folder buttons expose `aria-expanded` and toggle branches without changing the page. Selected project ancestors open automatically. Mobile page selection closes the disclosure. Header contacts show icon and text until (590px), then retain accessible names with icons alone.

### Links and buttons

Actions remain text-led. Source links include an icon, title and smaller repository label. Retry is an unfilled cyan text button. Hover changes link color or adds an underline. Keyboard focus uses a cyan outline (2px) offset (4px). Disabled buttons have half opacity.

### Project diagrams

Shallow outlined nodes pair a left icon with a concise label, explanatory captions below and arrows between stages. Desktop nodes have a minimum height (64px), default gap (46px), and rounded corners from the node role. Bypass and feedback paths carry labels. At (590px), stages form vertical rows with node left, caption right and downward arrows; nodes are at least (54px) tall. Bypass/feedback graphics become a textual flow note. A hidden figcaption supplies the complete diagram description.

### Screenshot gallery and dialog

Thumbnail buttons have a dark frame, thin border and row-radius corners; hover changes the border to cyan. Captions remain below images. Selection opens a native modal dialog with Close, Previous and Next buttons, a polite image-count announcement and wraparound left/right arrow navigation. Escape and clicking the dialog surface outside its content close it. The dialog is capped at (1200px or 94vw) and (94svh); its image is capped at (70svh). Absent screenshots produce no gallery.

### About banner, timeline and credentials

Contact text sits on readable navy while the real portrait overlaps the bottom/right edge. On narrow screens, contact text sits above the shorter portrait. Experience uses a thin vertical rule and small circular markers; dates sit beside role headings until (590px), then stack. Credentials are text-led entries with subtle separators and cyan verification links.

### Status and motion

Loading uses a small cyan dot with a (1s) alternating pulse. Errors use compact text and Retry. New page content moves upward by (4px) over (230ms ease-out), without a delayed reveal. Row and thumbnail transitions last (150ms). Reduced-motion preference disables animations and transitions. Navigation preserves URL/history behavior and focuses the new page heading after loading.

## Do's and Don'ts

### Do:
- **Do** preserve compact type, restrained line lengths and thin outline icons.
- **Do** keep original screenshots and captions inside the main content column.
- **Do** preserve accessible names, selection, visible focus and reduced motion.
- **Do** keep the portrait faithful to the original and contact text readable.

### Don't:
- **Don't** add terminal chrome, horizontal tabs or a second navigation model.
- **Don't** replace compact headings with oversized marketing typography.
- **Don't** introduce decorative shadows or turn every section into a card.
- **Don't** stretch original assets or add placeholder galleries.
