"use client"

import React from "react"

interface ProductDescriptionProps {
  description?: string
  className?: string
}

type FormattedBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullet-list"; items: string[] }
  | { type: "numbered-list"; items: { num: string; text: string }[] }
  | { type: "heading"; text: string; level: number }
  | { type: "space" }

// Renders inline formatting like **bold** or key: value highlights
function renderInline(text: string): React.ReactNode {
  // 1. If text has explicit markdown bold (**bold** or __bold__)
  const boldRegex = /(\*\*[^*]+\*\*|__[^\_]+__)/g
  if (boldRegex.test(text)) {
    const parts = text.split(boldRegex)
    return parts.map((part, index) => {
      if (
        (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
        (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
      ) {
        return (
          <strong key={index} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  // 2. If it's a key-value pattern (e.g. "جنس اثر: چوب گردو" or "Dimensions: 50x70")
  const kvMatch = text.match(/^([^:：\n]{2,35})([:：])\s*(.*)$/)
  if (kvMatch) {
    const [, label, colon, val] = kvMatch
    return (
      <>
        <strong className="font-bold text-foreground">
          {label}
          {colon}{" "}
        </strong>
        <span>{val}</span>
      </>
    )
  }

  return text
}

function parseDescription(raw?: string): FormattedBlock[] {
  if (!raw || !raw.trim()) return []

  // Normalize line breaks
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const lines = normalized.split("\n")

  const blocks: FormattedBlock[] = []
  let currentBulletList: string[] | null = null
  let currentNumberedList: { num: string; text: string }[] | null = null
  let currentParagraphLines: string[] = []

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      blocks.push({
        type: "paragraph",
        text: currentParagraphLines.join("\n"),
      })
      currentParagraphLines = []
    }
  }

  const flushBulletList = () => {
    if (currentBulletList && currentBulletList.length > 0) {
      blocks.push({
        type: "bullet-list",
        items: currentBulletList,
      })
      currentBulletList = null
    }
  }

  const flushNumberedList = () => {
    if (currentNumberedList && currentNumberedList.length > 0) {
      blocks.push({
        type: "numbered-list",
        items: currentNumberedList,
      })
      currentNumberedList = null
    }
  }

  const flushAll = () => {
    flushParagraph()
    flushBulletList()
    flushNumberedList()
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // 1. Empty lines
    if (trimmed === "") {
      flushAll()
      // Only keep one space block if previous wasn't already space
      const lastBlock = blocks[blocks.length - 1]
      if (!lastBlock || lastBlock.type !== "space") {
        blocks.push({ type: "space" })
      }
      continue
    }

    // 2. Markdown Headings: e.g. "# Heading", "## Heading", "### Heading"
    const headingMatch = rawLine.match(/^(\s*)(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      flushAll()
      blocks.push({
        type: "heading",
        level: headingMatch[2].length,
        text: headingMatch[3].trim(),
      })
      continue
    }

    // 3. Bullet list item: lines starting with "- ", "* ", "• ", "+ ", "▫ ", "▪ ", "— "
    const bulletMatch = rawLine.match(/^(\s*)[-*•+▫▪—]\s+(.+)$/)
    if (bulletMatch) {
      flushParagraph()
      flushNumberedList()
      if (!currentBulletList) {
        currentBulletList = []
      }
      currentBulletList.push(bulletMatch[2])
      continue
    }

    // 4. Numbered list item: lines starting with "1. ", "1) ", "۱. ", "۱) ", etc.
    const numberedMatch = rawLine.match(/^(\s*)(\d+|[۰-۹]+)[.)\-]\s+(.+)$/)
    if (numberedMatch) {
      flushParagraph()
      flushBulletList()
      if (!currentNumberedList) {
        currentNumberedList = []
      }
      currentNumberedList.push({
        num: numberedMatch[2],
        text: numberedMatch[3],
      })
      continue
    }

    // 5. Short title ending with colon (e.g. "ویژگی‌های اثر:" or "دستورالعمل نگهداری:")
    if (
      (trimmed.endsWith(":") || trimmed.endsWith("：")) &&
      trimmed.length < 60 &&
      currentParagraphLines.length === 0 &&
      !currentBulletList &&
      !currentNumberedList
    ) {
      flushAll()
      blocks.push({
        type: "heading",
        level: 3,
        text: trimmed,
      })
      continue
    }

    // 6. Regular text line (preserves linebreaks & spaces)
    flushBulletList()
    flushNumberedList()
    currentParagraphLines.push(rawLine)
  }

  flushAll()
  return blocks
}

export default function ProductDescription({ description, className = "" }: ProductDescriptionProps) {
  if (!description || !description.trim()) {
    return (
      <p className="text-muted-foreground/70 italic text-xs py-2">
        توضیحات تکمیلی برای این محصول ثبت نشده است.
      </p>
    )
  }

  const blocks = parseDescription(description)

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === "space") {
          return <div key={`space-${idx}`} className="h-2.5" />
        }

        if (block.type === "heading") {
          return (
            <div key={`heading-${idx}`} className="pt-2 pb-1">
              <h3 className="font-black text-foreground text-xs sm:text-sm flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-primary rounded-full shrink-0" />
                <span>{renderInline(block.text)}</span>
              </h3>
            </div>
          )
        }

        if (block.type === "bullet-list") {
          return (
            <ul key={`ul-${idx}`} className="my-2.5 flex flex-col gap-2 pr-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5 text-foreground/85">
                  <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2.5 ring-2 ring-primary/20" />
                  <span className="flex-1 leading-relaxed whitespace-pre-wrap">
                    {renderInline(item)}
                  </span>
                </li>
              ))}
            </ul>
          )
        }

        if (block.type === "numbered-list") {
          return (
            <ol key={`ol-${idx}`} className="my-2.5 flex flex-col gap-2 pr-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5 text-foreground/85">
                  <span className="size-5 rounded-md bg-primary/10 text-primary font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-primary/20 select-none">
                    {item.num}
                  </span>
                  <span className="flex-1 leading-relaxed whitespace-pre-wrap">
                    {renderInline(item.text)}
                  </span>
                </li>
              ))}
            </ol>
          )
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={`p-${idx}`}
              className="leading-relaxed whitespace-pre-wrap text-foreground/85 font-medium"
            >
              {renderInline(block.text)}
            </p>
          )
        }

        return null
      })}
    </div>
  )
}
