# Chat UI design reference (researched from a leading AI chat web app)

Purpose: transferable UI/UX patterns for restyling the Mongolian law Q&A React (Vite) app.
Use only the patterns and token values here. Do not copy logos, product names or brand copy.

## 0. Method and confidence

- Researched on 2026-10-18 in a real Chrome tab at 1440-1600px desktop width. Computed styles and
  CSS custom properties were read with `getComputedStyle`, and screenshots were taken.
- The browser already had a session signed in, so the page was the signed-in home (empty state).
  I did not send any prompts, open existing chats, or change account settings. To read light-mode
  values I temporarily switched `data-theme` on `<html>` in the DOM. That change was local only.
- **Could not observe:** the conversation view (it needs a sent message), streaming, message
  action buttons, the scroll-to-bottom button, and the real 390px mobile layout (the window resize
  had no effect). Those sections are marked **[GK]**, meaning they come from general knowledge of
  the product. **[OBS]** marks values measured directly.

## 1. Design philosophy (inferred)

1. **Content-first and chrome-light [OBS].** The empty state shows one sentence (24px, weight 400),
   one composer, and three quiet suggestion rows. The header has no background (transparent, 52px tall).
2. **Neutral greyscale with one accent [OBS].** Every surface is grey: #fcfcfc / #ffffff in light,
   #000 / #1b1b1b / #303030 in dark. The only colour is a blue accent (#3a83f7, link #2c67c5),
   used on the primary composer button and the "Upgrade" link.
3. **Hierarchy comes from text colour, not size or weight [OBS].** Nearly everything is 14 or 16px.
   Secondary items use grey (#8f8f8f / #5d5d5d) and section labels use weight 500. Nothing is bold.
4. **Soft, round geometry [OBS].** The composer is a full pill (26px radius at 52px height). Icon
   buttons are 36px circles. Sidebar rows use an 8px radius. Suggestion rows use 16px.
5. **Very light elevation [OBS].** The only shadowed element is the composer. Dark mode replaces
   the shadow with a 1px inset white hairline at 20% opacity.
6. **Translucent tokens [OBS].** Hovers, borders and the user bubble use black or white at low
   alpha, so they work on any surface.

## 2. Layout and structure

### 2.1 App shell [OBS]
- Two columns: a fixed **340px left sidebar** and the main area (`flex: 1`).
- The sidebar background equals the page background (#fcfcfc light, #000 dark). It is separated by
  a hairline divider (`--app-shell-sidebar-divider`: #0000001a light, #ffffff26 dark), not by a
  different fill.
- Main area: a transparent top bar about 52px tall. It holds a centred segmented "mode" toggle
  (pill, 36px tall, active segment white on a light-grey track) and right-aligned icon actions.

### 2.2 Sidebar contents (top to bottom) [OBS]
- Row 1: wordmark on the left, then search and "hide sidebar" icon buttons on the right (grey #8f8f8f).
- Primary nav rows: "New chat" (active, shown with a filled `#0000000d` / `#ffffff1a` background),
  then the feature links. Each row has an 18-20px outline icon, 14px/20px text at weight 400,
  `padding: 5px 8px`, `border-radius: 8px`, and an inset of about 6px from the sidebar edge.
- Section headers ("Projects", "Recents"): 14px/18px, **weight 500, grey #8f8f8f**, no uppercase,
  16px left padding, and about 24px of space above.
- History list: plain 14px text rows with no icons. The title is truncated with an ellipsis.
  Hover shows a rounded grey background.
- Pinned footer: avatar circle, name (14px/500), plan text (12px/16px, weight 500, #5d5d5d), and
  a small outlined pill button. It sits above a thin top divider.
- Collapse [GK]: on desktop the hide button turns the sidebar into a narrow icon rail (about
  52-56px) or hides it completely, and a "show sidebar" button appears top-left in the main area.
  Width animates over about 150-200ms.

### 2.3 Empty state [OBS]
- The greeting and composer sit together **centred vertically, slightly above the middle**. The
  greeting is at about 37% of the viewport height and the composer about 24-28px below it.
- Greeting: one line, 24px/28.8px, weight 400, primary text colour, normal letter-spacing.
- Composer width: **768px (48rem)**, centred.
- Below the composer: 3 suggestion rows, each **52px tall, 16px radius**. Each has a 20px outline
  icon and 16px/26px grey (#8f8f8f) text, left-aligned with the composer's text, with no border.
  On hover they get a soft grey background [GK].
- After the first message is sent, the composer moves to the bottom of the viewport and the
  greeting disappears [GK].

### 2.4 Conversation view [mostly GK; widths OBS]
- Thread column: `--thread-content-max-width: 48rem` (768px) [OBS]. Side gutter
  `--thread-gutter: 16px` [OBS]. Body inline padding 20px [OBS]. A compact variant of 40rem is
  used on narrower screens [OBS].
- **User message:** right-aligned bubble with `max-width` about 70-80% of the column and
  `border-radius: 24px` (rounded-3xl; 18px when it wraps to several lines). Padding is about
  10px 20px. The background is `--user-message-background-color` [OBS]: 5% of #0d0d0d over the
  surface in light (looks like #f4f4f4), 8% of #ededed in dark (looks like about #2f2f2f). Text
  is the primary colour, 16px/24px.
- **Assistant message:** **no bubble, no avatar, no border.** It is plain full-width text in the
  column at 16px/28px (about 1.75 line-height) using rich markdown. Paragraphs have about 16px
  between them; h2/h3 are about 20/18px at weight 600; lists are indented 24px; code blocks are
  rounded (radius about 12px) on a slightly darker surface with a header bar and a copy button.
- About 24-32px of vertical space between turns. No timestamps or names.
- Action row under each assistant message [GK]: small 32px ghost icon buttons (copy, thumbs
  up/down, regenerate, share), grey icons that turn darker on hover, each with a tooltip. Hover
  reveals them on older turns and they are always visible on the latest turn. The user message
  gets copy/edit on hover.

### 2.5 Composer [OBS unless marked]
- Container: `--composer-radius: 28px` (the measured element is 26px at 52px tall, which is a full
  pill). Background `--composer-background-color` is #ffffff light and #1b1b1b dark.
- Light shadow (exact):
  `0 0 0 1px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04), 0 4px 80px 8px rgba(0,0,0,.024)`
- Dark: `inset 0 0 1px rgba(255,255,255,.2)`, a hairline with no drop shadow.
- Single-line height 52px. Inner layout: `[+ attach 36px] [input flex-1] [secondary chips]
  [mic 36px] [primary 36px circle]`. Gutter `--composer-gutter: 12px`.
- Input: auto-growing contenteditable, 16px/26px, placeholder in tertiary grey (#8f8f8f light,
  #afafaf dark). It grows up to about 40% of the viewport, then scrolls [GK]. On multi-line input
  the buttons move to a second row and the radius drops to about 28px instead of a pill [GK].
- Icon buttons: 36x36, `border-radius: 9999px`, transparent background, grey icons.
- In the active thread the composer is pinned to the bottom with `--thread-composer-bottom-inset:
  24px` [OBS], and the scrolling thread fades out behind it [GK].

### 2.6 Footer disclaimer [GK]
- One centred line under the bottom composer, 12px/16px, secondary grey, with about 8px padding.
  The wording is in the spirit of "AI can make mistakes. Check important info." It does not
  appear in the empty state. **For our app: use it for a legal disclaimer in Mongolian.**

## 3. Design tokens

### 3.1 Colours [OBS]

| Role | Light | Dark |
|---|---|---|
| Page / main surface / sidebar bg | `#fcfcfc` | `#000000` |
| Elevated surface (composer, menus) | `#ffffff` | `#1b1b1b` |
| Elevated secondary (popovers) | `#ffffff` | `#303030` |
| Elevated tertiary (opaque grey fill) | `#f3f3f3` | `#212121` |
| Text primary | `#0d0d0d` | `#ededed` |
| Text secondary | `#5d5d5d` (or 65% of primary) | `#cdcdcd` |
| Text tertiary / placeholder / icons | `#8f8f8f` | `#afafaf` |
| Border default | `#0000001a` (10%) | `#ffffff26` (15%) |
| Border light | `#0000000d` (5%) | `#ffffff0d` (5%) |
| Hover / active row bg | `#0000000d` | `#ffffff1a` |
| User bubble bg | `color-mix(in oklab, #0d0d0d 5%, transparent)` | `color-mix(in oklab, #ededed 8%, transparent)` |
| Accent (primary button) | `#3a83f7` | `#2c67c5` |
| Link | `#2c67c5` | `#2c67c5` |
| Scrim (modal/drawer backdrop) | `#00000080` | `#00000080` |

Note [GK]: when nothing is typed, the classic product shows a **black/white** circular send button
(#0d0d0d with a white arrow in light, inverted in dark) rather than blue. Both styles work. For a
law app, a neutral dark send button with a restrained accent is the safer choice.

### 3.2 Typography [OBS]
- Font stack: `ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, "Apple Color Emoji",
  Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"`. Serif and mono stacks exist but are
  not used in the chrome. System fonts render Cyrillic well, so we need no webfont.
- Scale (Tailwind defaults): 12/16, 14/20, 16/24, 18/28, 20/28, 24/32, 30/36, 36/40.
- Usage: body and composer **16px**, line-height 24px (26px in the composer, about 28px in
  assistant prose [GK]). Sidebar rows 14/20 at 400. Section labels 14/18 at 500. Meta text 12/16
  at 500. Greeting 24px at 400. Buttons and the toggle 14px at 500.
- Weights in use: 400 and 500 in the chrome. 600 only for markdown headings [GK]. No 700.

### 3.3 Spacing [OBS]
- Base unit `--spacing: 0.25rem` (4px). Common steps: 4, 6, 8, 12, 16, 20, 24, 28.
- Sidebar row padding 5px 8px with a 6px outer inset. Composer gutter 12px (compact 8px). Thread
  gutter 16px. Thread inline padding 20px. Composer bottom inset 24px.

### 3.4 Radii [OBS]
- Scale: xs 2, sm 4, md 6, lg 8, xl 12, 2xl 16, 3xl 24, 4xl 32, full 9999px.
- Applied: sidebar rows 8px; suggestion rows 16px; composer 26-28px; icon buttons, segmented
  toggle and plan badge are full; popovers 8px; dialogs 24px (`--radius-form-dialog`).

### 3.5 Shadows [OBS]
- Composer (light): see 2.5. Everything else in the chrome is flat. Dark mode uses hairline borders
  instead of shadows.

### 3.6 Widths and breakpoints [OBS]
- Sidebar 340px. Thread and composer max width 48rem (768px); compact 40rem (640px).
- The most frequent media queries in the CSS: `min-width: 40rem` (640), `48rem` (768),
  `28rem`, `32rem`, `36rem`, `64rem` (1024), plus `max-width: 475px / 440px` phone tweaks.
- Inferred [GK]: below **768px** the sidebar becomes an off-canvas drawer. Below 640px the
  compact thread width and smaller gutters apply.

### 3.7 Motion [OBS + GK]
- Composer buttons: `transition: opacity .15s cubic-bezier(.4,0,.2,1)` [OBS].
- Sidebar open/close and drawer slide about 200-300ms ease-out. The scrim fades [GK].
- A `data-reduced-motion` flag exists on `<html>` [OBS], so respect `prefers-reduced-motion`.

## 4. Interaction details

- **Hover** [OBS token, GK behaviour]: rows and ghost buttons get `#0000000d` / `#ffffff1a`
  backgrounds with the same radius. Text colour does not change.
- **Primary composer button states:**
  - Empty input: shows a voice button (36px circle, accent fill) [OBS]. **For us:** show a disabled
    send button instead (about 30% opacity or a muted grey, `cursor: not-allowed`).
  - With text [OBS]: becomes "Send", a 36px circle in accent fill with an up-arrow icon, fading
    in with an opacity transition.
  - While streaming [GK]: becomes "Stop", the same circle with a small filled square icon. Clicking
    it aborts the stream.
- **Streaming indicator** [GK]: before the first token arrives, a small pulsing dot (or a
  "Thinking…" shimmer line) sits where the assistant text will appear. After that, text streams in
  place with no cursor box. Auto-scroll follows the stream only while the user is near the bottom.
- **Scroll-to-bottom** [GK]: when scrolled up, a 32-36px circular button with a down-arrow appears
  centred just above the composer. It has an elevated bg, a 1px border and a light shadow, and
  scrolls smoothly on click.
- **Message actions** [GK]: copy shows a check icon for about 2s after clicking. Tooltips are
  dark, 12-14px, 8px radius, and appear after about 300ms.
- **Keyboard** [GK]: Enter sends. Shift+Enter inserts a newline. IME composition must not send
  (check `e.nativeEvent.isComposing`; this matters for Mongolian Cyrillic keyboards). The composer
  is autofocused on load and after a new chat. Escape stops editing. Ctrl/Cmd+Shift+O opens a new
  chat, and Ctrl/Cmd+Shift+S toggles the sidebar.
- **Mobile** [GK, not observed]: the sidebar becomes a full-height drawer that slides in from the
  left (about 85% width, max 320px) over a #00000080 scrim. Tapping the scrim closes it. The top bar
  shows a hamburger on the left, the title or mode in the centre, and a new-chat icon on the right.
  The composer sticks to the bottom with safe-area padding (`env(safe-area-inset-bottom)`). In the
  empty state the greeting sits mid-screen and the composer may already be at the bottom.
  Suggestion rows become horizontally scrollable chips or are hidden.

## 5. How to apply to our app (checklist)

- [ ] Define CSS variables on `:root` for both themes from section 3.1. Use
      `@media (prefers-color-scheme: dark)` plus a `[data-theme]` override.
- [ ] Use the system font stack (3.2). Set body to 16px/1.5 and assistant prose to 16px/1.75.
      Use only weights 400/500, plus 600 for markdown headings.
- [ ] Shell: a 260-340px sidebar on the same background as the page, with a hairline right
      divider. The main column is flex:1 with a transparent 52px top bar.
- [ ] Sidebar: a "New chat" row with an icon (8px radius, 5px 8px padding), a grey 14px/500
      "history" label, and 14px truncated history rows with hover bg `#0000000d`.
- [ ] Empty state: centre a Mongolian greeting (24px/400) with the composer just below it
      (max 768px). Optionally add 3 suggestion rows of common legal questions (52px tall,
      16px radius, grey text, icon).
- [ ] Thread: a `max-width: 48rem` centred column with 16-20px side padding.
- [ ] User message: right-aligned, `background: var(--user-bubble)`, `border-radius: 24px`,
      `padding: 10px 20px`, `max-width: 75%`.
- [ ] Assistant message: plain text with no bubble or avatar, rendered as markdown. Show legal
      citations or sources as small grey 12-14px chips or links below the answer.
- [ ] Composer: white/#1b1b1b pill with radius 28px, min-height 52px, and the soft triple
      shadow. Auto-growing textarea. Circular 36px send button: disabled when empty, accent when
      ready, Stop (square icon) while streaming.
- [ ] After the first message, pin the composer to the bottom (24px inset) and fade the thread
      behind it with a gradient.
- [ ] Add a 12px grey legal disclaimer under the bottom composer.
- [ ] Add a pulsing dot before the first token, a scroll-to-bottom button, and a copy button
      with check feedback.
- [ ] Enter sends, Shift+Enter adds a newline, and IME composition is guarded.
- [ ] Below 768px, turn the sidebar into a drawer over a 50% black scrim, add a hamburger to the
      top bar, and add safe-area padding to the composer.
- [ ] Transitions: 150ms opacity on buttons, about 200ms for the drawer. Honour
      `prefers-reduced-motion`.

---

## Addendum (web research)

Added on 2026-10-18. Nothing above was changed. Tags: **[WEB]** means the value comes from a public
third-party writeup (sources in A.12). **[GK]** means general knowledge of the product. The live
site returned HTTP 403 to a server-side fetch, so nothing new here is [OBS]. **If a value here
disagrees with an [OBS] value above, the [OBS] value wins.**

### A.1 Cross-check of public token writeups [WEB]
- A reverse-engineered light-theme style guide agrees with the [OBS] values for text and borders:
  primary text `#0d0d0d`, secondary `#5d5d5d`, tertiary `#8f8f8f`, hairline `#0000001a`, hover
  veil `#0000000d`, scrim `#00000080`, and a system font stack with sizes 14/16/24 at weights
  400/500/600. It reports a sidebar fill of `#f9f9f9`, a 260-280px sidebar, a 52px header and a
  720-768px thread column. These are older or narrower variants of the [OBS] values (340px sidebar
  on the page bg, 48rem column).
- It also lists a divider `#e6e6e6`, a black (`#000`) tooltip fill with white text, and a
  **flat UI where elevation comes from 1px hairlines, not shadows**. That matches 3.5 above.
- An open-source recreation of the interface uses a 28px composer radius (matches 2.5), 36px
  circular composer buttons (matches), a 32px action-bar button with an **8px radius and no
  gap**, action icons `#5d5d5d` light / `#cdcdcd` dark, and hover tints of about 7% black (light)
  and 15% white (dark). Its dark composer surface is `#212121`, which matches the
  "elevated tertiary" token in 3.1.
- Older dark-theme values that are still widely cited [GK]: page `#212121`, sidebar `#171717`,
  composer/user bubble `#2f2f2f`, text `#ececec`. They are not current per the [OBS] table. Use
  them only if we want a softer, less high-contrast dark theme than pure `#000`.

### A.2 Conversation view, expanded [GK]
Expands 2.4. All the values below are recommendations that fit the [OBS] tokens.
- **Turn structure:** each turn is a full-width row containing the centred 48rem column. Wrap
  each message in an `<article>` with a visually hidden heading such as "You said:" / "Answer:",
  so screen readers can jump between turns.
- **Spacing:** about 20px between a user bubble and the answer below it. About 32-40px between
  an answer's action row and the next user bubble. Extra bottom padding equal to the composer
  height + 24px inset + about 16px, so the last line is never hidden under the composer.
- **User bubble wrapping:** keep `white-space: pre-wrap` so the user's own line breaks survive.
  Use `overflow-wrap: anywhere` for long URLs and article numbers. Very long user messages
  collapse after about 10 lines behind a "Show more" toggle.
- **Edit flow:** the edit (pencil) button turns the bubble into an inline textarea with the same
  radius and "Cancel" (ghost) and "Send" (filled pill) buttons. Sending forks the thread. Older
  branches are reachable with a small `< 2/2 >` pager under the message, 12-14px in grey.
- **Regenerate:** this also creates a branch, with the same `< n/m >` pager under the answer.
- **Errors:** an inline row in the answer slot, in 14px secondary text with a small warning icon
  and a "Retry" ghost button. Errors appear inline, never as a modal or toast.

### A.3 Streaming and the typing indicator, expanded [GK]
Expands section 4.
- **Pre-token state:** show a single 8-12px filled circle in primary text colour, pulsing in
  scale and opacity (about 1s ease-in-out, infinite) at the spot where the first word will
  appear. For longer waits, such as retrieval, swap it for a status line ("Searching laws…") in
  14px secondary grey with a moving shimmer gradient (about 1.5-2s loop).
- **During the stream:** append the text in place. Markdown is re-rendered incrementally, and an
  unclosed code fence is treated as an open code block. Do not show a blinking caret. Some
  versions show the same small dot at the end of the growing text until the stream finishes.
- **Batching:** flush tokens to the DOM once per animation frame (`requestAnimationFrame`), not
  once per token, so long answers do not cause layout thrash.
- **The action row and citations appear only after the stream completes**, fading in over
  about 150ms.
- **Stop:** the stop button keeps the partial text. The answer stays and gets a normal action row.
- **Auto-scroll:** while streaming, stick to the bottom only if the user was within about 64-100px
  of it when the chunk arrived. If the user scrolls up, stop following and show the
  scroll-to-bottom button (A.5).
- **Composer during the stream:** typing is still allowed, but Enter does nothing (or queues the
  message) until the stream finishes or is stopped.

### A.4 Message actions, expanded [WEB + GK]
Expands 2.4 and section 4.
- **Layout [WEB]:** a horizontal row of 32x32 ghost buttons with an 8px radius and 0 gap, with
  16-18px stroke icons. It is left-aligned with the answer text, sitting about 4-8px below it.
  Some writeups pull it slightly into the gutter (`margin-left: -8px`) so the first icon's glyph
  lines up with the text edge.
- **Order [GK]:** Copy, Thumbs up, Thumbs down, Read aloud (optional), Regenerate (sometimes with
  a model menu), More (...). For our app use: **Copy, Thumbs up, Thumbs down, Regenerate, then
  "Sources" if not shown inline**.
- **Visibility [GK]:** the latest answer always shows its row. Older answers show it on hover or
  focus-within (opacity 0 to 1, about 150ms). On touch devices it is always visible.
- **Feedback states:** after a thumbs click the chosen icon becomes filled and the other is
  hidden. Thumbs down optionally opens a small feedback dialog with reason chips and a free-text
  box. Copy swaps to a check icon for about 2s and announces "Copied" through an `aria-live`
  region.
- **User-message actions:** Copy and Edit sit under the bubble, right-aligned and shown on hover.

### A.5 Scroll-to-bottom button, expanded [GK]
Expands section 4.
- 32px circle, centred horizontally on the thread column, floating about 16px above the
  composer's top edge.
- Fill is the elevated surface (`#ffffff` / `#303030`) with a 1px border (`#0000001a` /
  `#ffffff26`), a soft shadow (`0 2px 8px rgba(0,0,0,.08)` in light, none in dark), and a 16px
  down-arrow icon in the primary colour.
- Show it when the distance from the bottom exceeds about 1 viewport height or about 200px.
  Fade and slide it in (opacity plus `translateY(4px)` to 0, about 150ms). On click use
  `scrollTo({ top: max, behavior: 'smooth' })`, or `'auto'` under reduced motion.
- Detect the position with an `IntersectionObserver` on a 1px sentinel at the end of the thread.
  This is cheaper than reading scroll events.
- Accessible name: "Scroll to latest message".

### A.6 Mobile, expanded [GK]
Expands section 4 (Mobile).
- **Breakpoints:** below 768px the sidebar is a drawer. At 640px and below use the compact thread
  width, a 12-16px gutter and a composer gutter of 8px.
- **Drawer:** `position: fixed`, full height, `width: min(85vw, 320px)`, slides from the left
  with `transform: translateX(-100%)` to 0 over about 250ms `cubic-bezier(.4,0,.2,1)`. The scrim
  fades from 0 to `#00000080`. Lock body scroll while it is open, trap focus inside it, and close
  it on Escape, a scrim tap, a swipe-left, or choosing a chat. It may use a slightly raised
  surface (`#ffffff` / `#1b1b1b`) because no divider is visible on mobile.
- **Top bar:** 48-52px tall. Hamburger (40px tap target) on the left, title centred and
  truncated, new-chat (pencil-square) icon on the right. Add a hairline bottom border once the
  thread has scrolled.
- **Composer:** pinned to the bottom with `padding-bottom: max(12px, env(safe-area-inset-bottom))`.
  Use a **16px minimum input font** so iOS does not zoom on focus. Use the `dvh` unit
  (`height: 100dvh`) so the on-screen keyboard does not hide the composer. Send/stop stays a 36px
  circle. The attach button may collapse into the "+" menu.
- **Touch targets:** at least 44x44px for anything tappable. Action rows are always visible.
  Tooltips are replaced by a long-press or skipped, so every icon needs an accessible label.
- **Empty state:** the greeting sits at about 40% of the height. Suggestions become a single
  horizontally scrollable row of pill chips (36px tall, full radius, 1px hairline border, 14px
  text), or they are hidden.

### A.7 Markdown rendering [GK, consistent with 2.4 and 3.2]
The assistant prose container uses 16px/28px, primary text, and `max-width: 100%` of the 48rem
column.

| Element | Spec |
|---|---|
| Paragraph | `margin: 0 0 16px`. The last child has no bottom margin. |
| h1 | 24px/32px, weight 600, margin-top 32px, margin-bottom 16px (rare in answers) |
| h2 | 20px/28px, 600, margin 28px 0 12px |
| h3 | 18px/28px, 600, margin 24px 0 8px |
| h4-h6 | 16px/24px, 600 |
| Strong | weight 600, same colour. Emphasis in italic. |
| Lists | `padding-left: 24-26px`. Items have `margin: 4-8px 0`. Nested lists sit tighter (4px). Markers use the primary colour. `ol` uses decimal, then lower-alpha when nested. |
| Blockquote | `border-left: 2px solid` default border token, `padding-left: 16px`, secondary text colour, not italic |
| Horizontal rule | 1px default border, `margin: 24-32px 0` |
| Inline code | mono stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`), 14px (0.875em), `padding: 2px 4-6px`, radius 4-6px, bg `#ececec` light / `#424242` or about `#ffffff1a` dark, weight 500 |
| Link | Accent link colour `#2c67c5` (or primary colour with underline), `text-underline-offset: 2-3px`. Opens in a new tab with `rel="noopener"`. |

**Code blocks**
- Container: radius 12px (sometimes 8px), bg `#f9f9f9` light / `#171717` or `#0d0d0d` dark, 1px
  hairline border in light mode. `margin: 16px 0`, `overflow: hidden`.
- Header bar: about 36px tall (`padding: 8px 16px`). It shows the language label on the left
  (12px, secondary grey, lower-case) and on the right a ghost "Copy" button with a 14-16px icon and
  12px label, which switches to a check icon and "Copied" for about 2s. Some versions add an "Edit"
  button. The header shares the block bg or sits one step darker, with no divider.
- Body: `padding: 16px`, mono 14px/20-22px, `overflow-x: auto` (horizontal scroll, no wrapping),
  `tab-size: 2-4`. Syntax highlighting uses a restrained theme with muted colours.
- In a long code block the header sticks to the top of the viewport while scrolling.

**Tables**
- Wrapper with `overflow-x: auto` so wide tables scroll inside the column, not the page.
- `border-collapse: separate; border-spacing: 0`. A 1px default-border bottom line under each row,
  and an outer border with a 8-12px radius in newer versions.
- `th`: 14px, weight 600, left-aligned, `padding: 8-12px 12-16px`, optional bg
  `#f9f9f9` / `#ffffff0d`. `td`: 14-16px/24px with the same padding. No zebra stripes.

**Citations**
- Inline: a small pill right after the sentence it supports. It is 20px tall, has a full radius,
  `padding: 0 8px`, 12px/500 text in secondary grey, and bg `#0000000d` / `#ffffff1a`. The label
  is the source's short name, and multiple sources show as "+2". Hovering or focusing opens a
  popover card (8-12px radius, elevated surface, light shadow, about 280-320px wide) with the
  title, domain or favicon, and a snippet.
- Footer: after the answer, a "Sources" button with stacked favicons opens a right-side panel (or
  a bottom sheet on mobile) that lists every source as a card.
- **For the law app:** label the pill with the legal reference (for example, "ИХШХШ 25.1" or
  "Хууль §12"), link it to the official text, and list the full citations under the answer.

### A.8 Keyboard shortcuts [WEB]
Confirmed across several public shortcut guides. The in-app list (Ctrl/Cmd+/) is the source of
truth.

| Action | Mac | Windows/Linux |
|---|---|---|
| Send message | Enter | Enter |
| New line | Shift+Enter | Shift+Enter |
| New chat | Cmd+Shift+O | Ctrl+Shift+O |
| Search chats | Cmd+K | Ctrl+K |
| Focus composer | Shift+Esc | Shift+Esc |
| Toggle sidebar | Cmd+Shift+S | Ctrl+Shift+S |
| Copy last answer | Cmd+Shift+C | Ctrl+Shift+C |
| Copy last code block | Cmd+Shift+; | Ctrl+Shift+; |
| Delete chat | Cmd+Shift+Backspace | Ctrl+Shift+Backspace |
| Show shortcut list | Cmd+/ | Ctrl+/ |
| Edit last message [GK] | Up arrow in an empty composer | Up arrow in an empty composer |

- **Search (Cmd+K) dialog [GK]:** a centred modal about 640-680px wide with a 16-24px radius,
  elevated surface, and an `#00000080` scrim. It has a borderless search input at the top
  (16px) and results grouped by date below (Today, Yesterday, Previous 7 days, Previous 30 days,
  then by month). It is fully keyboard-navigable: arrows move, Enter opens, Esc closes.
- **Sidebar history grouping [GK]:** the same date buckets as search, each with a 12-14px/500
  grey label. Each row has a "..." menu on hover (Share, Rename, Archive, Delete; Delete in red
  `#e02e2a` / `#ff8583`).
- For our app, implement only: Enter, Shift+Enter, Ctrl/Cmd+Shift+O, Ctrl/Cmd+K (if we have
  history search), Shift+Esc, and Escape to stop streaming or close menus. Guard IME composition
  (see section 4).

### A.9 Menus, tooltips and modals [WEB + GK]
- **Menu/popover [GK]:** elevated secondary surface (`#ffffff` / `#303030`), 12-16px radius,
  `padding: 6px`, min-width about 200px. Light shadow `0 4px 16px rgba(0,0,0,.08)` plus a hairline
  border, and a hairline only in dark. Items are 36px tall, `padding: 8px 10px`, radius 8px, 14px
  text with an 16-18px icon and 8-12px gap, hover `#0000000d` / `#ffffff1a`. Separators are 1px
  hairlines with `margin: 4px 0`. The destructive item uses red text.
- **Tooltip [WEB]:** black fill (`#000`) with white text in both themes, 12-14px/500,
  `padding: 4px 8px`, 6-8px radius. Appears after about 300ms on hover or immediately on focus.
  Optional keyboard hint in lighter grey after the label.
- **Modal [OBS radius, GK rest]:** 24px radius (`--radius-form-dialog`), elevated surface,
  `max-width: 440-550px`, `padding: 20-24px`, `#00000080` scrim with no blur. Title 18px/600,
  body 14-16px secondary, actions right-aligned (ghost Cancel, filled primary; red for
  destructive). Enter animation: opacity 0 to 1 plus scale .96 to 1 over about 150-200ms.
- **Buttons [GK]:** the filled primary is a pill in black on white (`#0d0d0d` bg with white text,
  inverted in dark), 36-40px tall, `padding: 0 14-16px`, 14px/500. The secondary is a pill with a
  1px hairline border. The ghost has no border and the hover veil.
- **Icons [GK]:** single-colour outline icons, 1.5-2px stroke (about 1.75 at 20px), round caps and
  joins, sizes 16 (inline/meta), 18-20 (rows, actions), 24 (top bar on mobile). Any outline set such
  as Lucide fits this style.

### A.10 Accessibility [GK]
- **Landmarks:** `<nav aria-label="Chat history">` for the sidebar, `<main>` for the thread,
  `<form>` for the composer. Add a "Skip to message input" link as the first focusable element.
- **Live updates:** wrap the streaming answer in an `aria-live="polite"` region that announces the
  answer once it finishes, not every token (`aria-busy="true"` while streaming). Status messages
  ("Copied", "Stopped", errors) go in a separate visually hidden polite live region.
- **Composer:** a real `<textarea>` with an `aria-label` (for example, "Асуултаа бичнэ үү").
  Send/Stop is a `<button type="submit">` whose `aria-label` changes with state. Use
  `aria-disabled` (not removal) when it is empty, so it stays discoverable.
- **Icon-only buttons:** every one needs an `aria-label`. Tooltips repeat the label and do not
  replace it. The thumbs buttons use `aria-pressed`.
- **Focus:** visible ring on every interactive element, for example
  `outline: 2px solid` accent (`#3a83f7`) with `outline-offset: 2px`, shown via `:focus-visible`.
  Hover-only actions must also appear on `:focus-within`. Menus and dialogs trap focus, close on
  Escape, and return focus to their trigger.
- **Contrast:** primary `#0d0d0d` on `#fcfcfc` is about 19:1 and secondary `#5d5d5d` is about
  6.6:1, both pass. Tertiary `#8f8f8f` on white is about 3.2:1, so **use it only for placeholders
  and non-essential text and icons**, never for disclaimer or citation text. Use `#5d5d5d` for the
  legal disclaimer.
- **Motion:** under `prefers-reduced-motion: reduce`, disable the pulsing dot animation (show a
  static dot or the "…" text), the shimmer, the drawer slide (use a fade), and smooth scrolling.
- **Language:** `<html lang="mn">`. Mark any quoted Latin-script legal text with `lang` as needed.
- **Zoom:** the layout must survive 200% zoom and a 320px width without horizontal page scroll.
  Code blocks and tables scroll inside their own wrappers.

### A.11 Applying this to a legal Q&A chat app [GK]
This complements the checklist in section 5.
1. **Trust over flair.** Keep the neutral greyscale. Use the accent only for links, focus and
   citations, so legal references stand out as the one coloured element. Use a dark neutral send
   button.
2. **Citations are first-class.** Every answer that cites a law shows inline citation pills
   (A.7) and a "Эх сурвалж" (sources) list under the answer: law name, article/clause, date of
   the version, and a link to the official text (for example, legalinfo.mn). Clicking a pill opens
   a side panel (desktop) or bottom sheet (mobile) with the article text quoted.
3. **Visible disclaimer.** Put the 12px footer line under the composer in `#5d5d5d`, for example
   "Энэ нь хууль зүйн мэргэжлийн зөвлөгөө биш. Чухал асуудлаар хуульчтай зөвлөлдөнө үү." It should
   be shown in the thread view and, for legal apps, also in the empty state.
4. **Empty state suggestions:** 3-4 common questions as suggestion rows, for example labour
   contract termination, divorce and alimony, property registration, traffic fines. Each gets a
   relevant outline icon.
5. **Readable long answers:** keep the prose at 16px/1.75 within 48rem. Encourage h3 subheadings
   ("Хуулийн үндэслэл", "Таны хийх алхам") and numbered steps. Tables are good for comparing
   deadlines or fees.
6. **Retrieval status:** use the shimmer status line (A.3) for "Хууль хайж байна…" so users
   understand the wait.
7. **Feedback loop:** thumbs down offers reasons such as "Буруу хууль иш татсан" (wrong law cited)
   or "Хуучирсан мэдээлэл" (outdated info). This is valuable for a legal corpus.
8. **Privacy cue:** legal questions are sensitive. A small "Чат устгах" (delete chat) option in
   the sidebar row menu and a clear "new chat" make it easy to start over.
9. **Cyrillic and IME:** system fonts cover Mongolian Cyrillic (including Ө and Ү). Always check
   `isComposing` before sending on Enter.

### A.12 Sources [WEB]
- Refero style reference (reverse-engineered light-theme tokens):
  https://styles.refero.design/style/52a007ed-ad1b-46a6-bd44-b76f91df6d0c
- assistant-ui open-source interface recreation: https://www.assistant-ui.com/examples/chatgpt
- Keyboard shortcut guides: https://www.hongkiat.com/blog/chatgpt-keyboard-shortcuts/ ,
  https://www.ai-toolbox.co/chatgpt-management-and-productivity/chatgpt-keyboard-shortcuts-guide ,
  https://www.coursera.org/articles/chatgpt-keyboard-shortcuts ,
  https://www.tomsguide.com/ai/these-4-chatgpt-keyboard-shortcuts-will-change-how-you-write
- A direct fetch of the live site returned HTTP 403, so nothing in this addendum was measured live.

## Applied to this app (2026-10-18, second pass)

What the app now implements from this reference, beyond the section 5 checklist:

- **Sidebar:** chat search (Ctrl/⌘K, Esc clears it); history grouped by date (Өнөөдөр, Өчигдөр,
  Сүүлийн 7 хоног, Сүүлийн 30 хоног, Өмнөх); hover hints for shortcuts; an undo toast after deleting
  a chat (6s); a light/dark/system theme switch in the footer, applied before first paint.
- **Messages:** user turns get copy and "edit and ask again" on hover; assistant turns get copy,
  and the last answer also gets "answer again", which replaces the answer and also covers error
  retries. Actions show on hover and always on the latest turn and on touch screens.
- **Streaming:** a shimmer status line with a seconds counter replaces the pulsing dot. New turns
  fade up over 250ms. Screen readers hear the answer once it finishes, through an `sr-only` live
  region, not token by token.
- **Markdown:** code blocks have a 36px header bar with the language and a Copy button; tables sit
  in a horizontal-scroll wrapper; inline code uses a mono stack.
- **Tooltips:** dark pill tooltips (12px/500, 8px radius, 300ms delay) via `data-tip`; above the
  control in the bottom dock, below it elsewhere; hidden on touch.
- **Shortcuts:** Enter / Shift+Enter, ⌘⇧O new chat, ⌘⇧S sidebar, ⌘K search, ⌘⇧C copy the last
  answer, Shift+Esc focuses the composer, Esc stops an answer.
- **Mobile:** 16px search input so iOS doesn't zoom.

Not done yet: GFM tables need `remark-gfm`, which is not installed, so pipe tables in answers
still render as plain text. Thumbs feedback needs a backend endpoint. Citation chips need the
backend to return structured sources.
