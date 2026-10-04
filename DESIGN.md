---
name: Borworn
description: A warm personal notebook with editorial headings and a practical writing workspace.
colors:
  background: "#fdfcf9"
  foreground: "#242320"
  card: "#fff"
  primary: "#242320"
  primary-foreground: "#fff"
  secondary: "#f4f2ed"
  muted: "#f3f1ed"
  muted-foreground: "#6d685f"
  accent: "#fff0e8"
  destructive: "#c43223"
  border: "#e5e2dc"
  input: "#ddd9d2"
  ring: "#426cce"
  link: "#426cce"
  status-draft: "#9f4c2b"
  publish: "#b54825"
  sidebar: "#fdfcf9"
  sidebar-foreground: "#423e37"
  sidebar-primary: "#c64e29"
  sidebar-accent: "#fcf0e7"
  sidebar-border: "#e8e3da"
  brand-dot: "#ce5931"
  nav-current: "#a94326"
  button-hover: "#49453e"
  button-outline-hover: "#f2efe8"
  resource-border: "#dededb"
  resource-border-hover: "#9caac5"
  tag-background: "#f2f1ee"
  tag-border: "#e9e7e2"
  tag-text: "#63615d"
  editor-background: "#fffefb"
  editor-border: "#eee9e0"
  field-background: "#fffdfa"
  field-border: "#ded9d0"
  draft-background: "#fff9f3"
  draft-border: "#e6bbaa"
  published-background: "#f8faf0"
  published-border: "#d1d5bc"
  published-text: "#677244"
typography:
  display:
    fontFamily: 'Georgia, "Times New Roman", "Leelawadee UI", serif'
    fontSize: "clamp(52px, 5.9vw, 83px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-3px"
  headline:
    fontFamily: 'Georgia, "Times New Roman", "Leelawadee UI", serif'
    fontSize: "clamp(36px, 4.5vw, 54px)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-1.4px"
  title:
    fontFamily: 'Arial, "Leelawadee UI", Tahoma, sans-serif'
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.75
  body:
    fontFamily: 'Arial, "Leelawadee UI", Tahoma, sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
  reading:
    fontFamily: 'Arial, "Leelawadee UI", Tahoma, sans-serif'
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: 'Arial, "Leelawadee UI", Tahoma, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: 'Arial, "Leelawadee UI", Tahoma, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.75
  eyebrow:
    fontFamily: 'Arial, "Leelawadee UI", Tahoma, sans-serif'
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.75
    letterSpacing: "1.8px"
  editor:
    fontFamily: 'Georgia, "Leelawadee UI", serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.9
rounded:
  sm: "4px"
  md: "6px"
  lg: "0.5rem"
  xl: "12px"
  public-control: "5px"
  search: "8px"
  editor: "11px"
  resource: "16px"
  avatar: "50%"
spacing:
  micro: "4px"
  sm: "8px"
  compact: "12px"
  md: "16px"
  panel: "20px"
  lg: "24px"
  public-gutter: "28px"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.public-control}"
    padding: "11px 22px"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
    textColor: "{colors.primary-foreground}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.public-control}"
    padding: "11px 22px"
  button-outline-hover:
    backgroundColor: "{colors.button-outline-hover}"
  button-owner:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-publish:
    backgroundColor: "{colors.publish}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  input-owner:
    backgroundColor: "{colors.field-background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "41px"
  tag:
    backgroundColor: "{colors.tag-background}"
    textColor: "{colors.tag-text}"
    rounded: "{rounded.public-control}"
    padding: "3px 10px"
  resource-card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.resource}"
    padding: "18px 20px"
  navigation:
    textColor: "{colors.foreground}"
    typography: "{typography.caption}"
  writing-editor:
    backgroundColor: "{colors.editor-background}"
    rounded: "{rounded.editor}"
    padding: "20px"
---

# Design System: Borworn

## Overview

**Creative North Star: "The Personal Notebook / สมุดบันทึกส่วนตัว"**

Borworn feels warm, personal, and quietly editorial. A paper-colored canvas, charcoal text, generous reading space, and serif headings make the public site feel like a personal notebook. Straightforward sans-serif navigation and metadata keep the writing easy to scan.

The owner workspace shares the same palette and type families but uses denser lists, compact controls, and a lightly enclosed writing surface. Buttons, cards, and fields are simple, courteous, and clear to use, with modestly curved edges. This description and the color names below were confirmed by the owner; no additional visual anti-reference was specified.

**Key Characteristics:**

- Warm paper and charcoal, with terracotta highlights and blue links.
- Serif display headings paired with practical sans-serif text.
- Mostly flat surfaces separated by tone and fine borders.
- Open public reading layouts and a compact owner workspace.
- Real portrait imagery and restrained outline icons.

Evidence: extracted from `src/index.css`, the public and owner components, and existing assets on 4 October 2026. The homepage was inspected in the local browser, including computed body, display, navigation, button, section-heading, and footer styles. Owner styles and remaining responsive behavior were documented from source rather than authenticated browser verification. Frontmatter records observed values, including reused hard-coded component colors; it does not imply those values have all been centralized in CSS. The body follows the [DESIGN.md format](https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md).

## Colors

The sidecar's eight-step tonal ramps are synthesized previews of the extracted colors, not new application tokens. Component examples are standalone previews of existing patterns; their sample labels are illustrative.

The palette combines **Paper / กระดาษ**, **Charcoal / ถ่าน**, **Terracotta / ดินเผา**, and **Link Blue / น้ำเงินลิงก์**, with muted neutral surfaces and semantic publication states. Frontmatter values are normative; the CSS token names are preserved wherever available.

### Primary

- **Charcoal:** `primary` and `foreground` provide body text and dark public actions; `primary-foreground` supplies their white text.
- **Terracotta:** `publish` identifies the publication action. `brand-dot`, `nav-current`, `sidebar-primary`, and `status-draft` are distinct existing shades with distinct contexts, not one interchangeable accent.

### Secondary

- **Link Blue:** `link` marks text links and linked project headings; `ring` uses the same color for keyboard focus. It is a functional accent rather than a large background treatment.

### Neutral

- **Paper:** `background` and `sidebar` supply the warm page canvas.
- **White and pale paper layers:** `card`, `secondary`, `muted`, `editor-background`, and `field-background` distinguish contained surfaces.
- **Quiet text:** `muted-foreground` supplies common metadata and supporting copy. Some component-specific text shades remain hard-coded in the source.
- **Fine separators:** `border`, `input`, and the component border tokens define quiet divisions.

### Semantic states

Draft badges combine terracotta text with pale warm fills and borders. Published badges use olive text with pale green fills and borders. Destructive controls use the separate red `destructive` token.

**The Contextual Accent Rule.** Preserve the existing distinction between blue links and focus, terracotta identity and owner actions, and olive published status; do not flatten them into a single accent.

## Typography

**Display Font:** Georgia, with Times New Roman, Leelawadee UI, and serif fallbacks.

**Body Font:** Arial, with Leelawadee UI, Tahoma, and sans-serif fallbacks.

**Editor Font:** Georgia with Leelawadee UI and serif fallbacks. Inline code uses Consolas and monospace.

The serif/sans pairing gives headings a personal editorial character while navigation, forms, and article text remain direct and legible. These are system font stacks; no remote font loading is part of the current implementation. The system uses contextual sizes rather than a single mathematical type scale.

### Hierarchy

- **Display:** the frontmatter display role describes the homepage heading. At widths up to 1100px it becomes 65px; up to 700px it uses clamp(36px, 11vw, 48px), line-height 1.08, and tracking -1px beside a compact portrait.
- **Headline:** serif inner-page headings use the headline role, becoming 38px at up to 700px.
- **Title:** the title role describes public section headings. Writing previews instead use sans-serif titles at clamp(21px, 2.6vw, 26px), weight 400, line-height 1.45. Project titles use clamp(20px, 2vw, 24px), weight 600, line-height 1.4.
- **Body:** the base body role is used for ordinary public text. Reading prose uses the reading role and becomes 17px on small screens; project prose remains 16px.
- **Label and Caption:** public controls generally use 14px text. Common public metadata and the footer use the caption role; owner table metadata and badges use 12px.
- **Article title:** sans-serif, 28px, weight 500, line-height 1.65, tracking -0.4px; 24px on small screens.
- **Workspace title:** serif, 31px, weight 400, line-height 1.25, tracking -0.6px; 36px at 1500px and above, 29px at up to 700px.
- **Eyebrow:** the tracked small-label role is used sparingly; it is not a universal label style.

**The Two Voices Rule.** Keep serif type for identity, prominent public headings, and the writing input; preserve sans-serif article titles, prose, navigation, and operational controls.

## Layout

Public pages use centered containers: header/footer at a maximum of 1440px, main content at 1180px, inner pages at 920px, writing previews at 760px, and article reading at 690px. About body copy and reading prose are additionally limited to 68ch. Standard main gutters are the frontmatter public-gutter value; mobile gutters are 22px.

Spacing is contextual rather than a strict universal grid. The frontmatter spacing entries capture recurring steps, not an exhaustive enforced scale. Current inner-page headings use 48px top / 24px bottom padding, becoming 32px / 24px on mobile. Writing previews use 24px block padding. Paragraph rhythm in prose is 18px.

The homepage uses a two-column introduction with portrait imagery, followed by three divided columns. Resource cards use a two-column grid. About uses a 2:1 text/sidebar grid. The owner workspace uses a library/editor grid with minmax(340px, 0.95fr) and minmax(400px, 1.05fr), a 26px gap, and a persistent sidebar.

### Responsive behavior

- **Up to 1100px:** library/editor stacks; the homepage lower section becomes two columns with its introductory section spanning both.
- **Up to 700px:** content grids become one column; the hero pairs its heading with a compact portrait, followed by full-width introduction and actions. Latest Notes and Archive precede Interests in document order; the desktop grid places Interests visually first. Navigation wraps onto its own full-width row, About's side divider becomes a top divider, and owner gutters and editor padding tighten.
- **Below 768px:** the owner sidebar uses its mobile drawer behavior. This breakpoint is separate from the public 700px layout breakpoint. Desktop sidebar width is 16rem; mobile drawer width is 18rem.
- **1500px and above:** the owner grid gap grows to 36px and editor padding grows to 25px.
- **Small screens or coarse pointers:** key links and standalone controls have a minimum 44px target size. Formatting toolbar controls become 44px square.
- Long content wraps; filters and action bars can wrap; code blocks and the compact library table can scroll where needed.

## Elevation & Depth

The confirmed philosophy is flat by default: distinguish sections through pale fills, thin borders, whitespace, and dividers. Public resource cards have no resting shadow. The writing editor uses the faint existing shadow `0 2px 15px #33251606`; it suggests a writing surface without turning it into a floating tile.

Owner primitive outline buttons and inputs inherit the component library's small shadow where not overridden. Dialogs and sheets use stronger elevation with dimmed overlays. Do not apply their overlay depth to ordinary public content.

**The Quiet Surface Rule.** Keep ordinary reading and list surfaces flat; preserve the editor's subtle shadow and reserve pronounced elevation for overlays.

Motion has one focal moment: the homepage portrait settles like a photograph placed on a notebook page, moving only 4px and 1 degree over 560ms. It runs once per page arrival, starts fully visible, and never delays interaction. Public sections do not repeat this entrance.

Feedback stays short: navigation underlines draw over 180ms, public action arrows move 3px over 150ms, and project disclosure chevrons rotate over 200ms. Opening contribution text uses a 180ms opacity transition; closing remains immediate with native details behavior. Arrivals use cubic-bezier(0.16, 1, 0.3, 1), with no bounce or loop. Existing public background/border transitions remain 0.15s, and component-library overlays retain their 200ms duration utilities.

Reduced-motion settings skip the portrait and text animations, remove transitions and overlay animations, disable smooth scrolling, and keep action arrows stationary. Navigation and disclosure states still change immediately, preserving feedback. Motion uses CSS and the existing Lucide icon family, with no added dependency or continuous effects.

## Shapes

Control corners are modest: public buttons and tags use the public-control radius, library buttons and inputs use md, and public search uses search. Resource cards and portrait imagery use resource; the owner writing container uses editor. There is no single radius applied to every component.

Dividers are thin and straight. Avatars are circular, 48px publicly and 32px in the owner identity. The hero portrait uses a 4:5 crop with object-position center 30%, at a maximum width of 320px (104px beside the mobile heading, 88px at widths up to 360px). Resource links and project headings wrap instead of relying on decorative clipping.

## Components

### Buttons

Public actions pair a dark filled primary with a transparent outlined alternative. Frontmatter records their default color, padding, and corners; hover darkens the filled button and adds a pale fill to the outlined version. The header action is more compact (10px 16px padding, 12px icon gap), while normal public actions have a 22px gap.

Owner buttons expose default, outline, secondary, ghost, link, and destructive variants through `src/components/ui/button.tsx`. Standard size is 36px high with 6px corners. Writing actionbar overrides use 12px regular text; Publish uses its dedicated terracotta color and hover shade. Disabled primitive controls reduce opacity and stop pointer interaction.

### Inputs / Fields

Public search is a white, bordered search row with rounded corners and a focus-within outline. Owner fields use a pale paper fill, a thin field border, 16px input text, and 41px height before touch-target overrides. The writing input is serif, padded, vertically resizable, and has a 380px minimum height (320px on small screens).

Global keyboard focus uses a 2px blue outline with a 4px offset. The writing input moves this outline inward. Library primitives additionally provide a focus ring and destructive invalid-state treatment; field overrides remove their small shadows. Keep these distinctions explicit rather than inventing one universal focus appearance.

### Navigation

The wordmark is lowercase serif text with a terracotta full stop. Public navigation uses small sans-serif links, blue hover, and a terracotta current-page state. It stays visible and wraps to a second row on small screens.

The owner sidebar uses outline icons, 44px rows, and a pale warm active background. It becomes a drawer below the owner mobile breakpoint. Icons normally remain subordinate to labels.

### Tags and Filters

Tags are small neutral chips with a light border and modest corners. Public filter links use a terracotta underline for selection. Owner library filter buttons likewise indicate selection with text color and an underline, exposing pressed state rather than decorative tabs.

Profile interests are non-interactive list chips, separate from article tags. They name interests without promising a filtered Notes destination. Only article tags retain filter links.

Draft and published badges pair written state labels with distinct text/fill/border combinations. Keep both the label and the color distinction.

### Cards / Containers

Resource cards are white, finely bordered, rounded, and padded; hover changes border and fill without adding shadow. Project cards share this surface treatment, with a blue heading and readable description.

Project cards lead with a concise excerpt of the existing contribution text, then a distinct Tech Stack group. A native details disclosure retains the full contribution text; it uses a blue labeled summary, visible keyboard focus, and a minimum 44px touch height. Public rendering omits parenthetical PBI identifiers without changing stored owner content.

The owner editor is an off-white bordered container with subtle elevation. Its toolbar and writing surface form a second paper layer; actionbars wrap as needed.

### Writing Lists and Article Content

Writing previews are open text rows separated by fine rules, with author/date/reading-time metadata, a title, and an excerpt. Latest-entry rows use a small tinted icon, wrapping title, and compact date. Notes icons use a pale olive treatment; Archive icons use pale tan.

Article pages combine a circular portrait, author metadata, a sans-serif title, and narrow readable prose. Markdown links are blue and underlined; quotations use a thin muted left rule. Code blocks have a pale fill, fine border, rounded corners, and horizontal overflow. Do not convert these open reading patterns into a universal card grid.

Article endings retain publication details and provide a return link to the writing index. Preview excerpts end at a word boundary when available. Counts use singular or plural labels appropriate to the result.

Standalone sign-in, error, and permission pages use a narrow paper canvas, serif headings, clear supporting text, and a separated recovery-action group. Filled buttons retain white text; only plain text links receive blue underlines. Authentication errors use the destructive text token and an announced alert.

Text selection uses the warm accent fill with Charcoal text; editable fields use a Link Blue caret. Owner statistics and dates use tabular numerals. Mobile search inputs stay at 16px, and compact owner action labels stay at least 12px.

## Do's and Don'ts

### Do:

- **Do** preserve warm Paper, Charcoal text, Terracotta highlights, and Link Blue interactions in their documented contexts.
- **Do** use the existing serif and sans-serif stacks, including Thai fallbacks.
- **Do** keep public reading spacious and owner controls compact within the same identity.
- **Do** reuse contextual corners, borders, and quiet surface layers rather than forcing one radius everywhere.
- **Do** retain visible keyboard focus, reduced-motion behavior, wrapping content, and enlarged touch targets.
- **Do** check later CSS overrides when extending a component; final section headings, captions, table labels, and preview spacing differ from earlier declarations.

### Don't:

- **Don't** replace the existing palette or font families during a refinement without an explicit redesign request.
- **Don't** add pronounced resting shadows to public reading rows or resource cards.
- **Don't** use publication-state colors as interchangeable decorative accents.
- **Don't** assume every heading is serif or every component uses the same corner radius.
- **Don't** treat source-documented responsive and owner styles as a completed accessibility or browser conformance audit.

