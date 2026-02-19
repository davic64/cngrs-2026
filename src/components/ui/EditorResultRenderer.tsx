"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EditorResultRendererProps {
  data: string; // JSON string from Editor.js
  className?: string;
}

export function EditorResultRenderer({
  data,
  className,
}: EditorResultRendererProps) {
  if (!data) return null;

  let parsedData: any = null;
  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    // If not JSON, it might be plain text from previous implementation
    return <div className={cn("whitespace-pre-wrap", className)}>{data}</div>;
  }

  if (!parsedData || !parsedData.blocks) return null;

  return (
    <div className={cn("space-y-4 text-left", className)}>
      {parsedData.blocks.map((block: any) => {
        switch (block.type) {
          case "header": {
            const levels: Record<number, string> = {
              2: "text-lg font-black mt-6 mb-2",
              3: "text-base font-black mt-4 mb-1",
              4: "text-sm font-black mt-3 mb-1",
            };
            const Tag = `h${block.data.level}` as any;
            return (
              <Tag
                key={block.id}
                className={cn(
                  "text-secondary uppercase tracking-tight",
                  levels[block.data.level] || levels[2],
                )}
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            );
          }
          case "paragraph":
            return (
              <p
                key={block.id}
                className="text-[11px] leading-relaxed text-gray-500 font-medium mb-3"
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            );
          case "list": {
            const ListTag = block.data.style === "ordered" ? "ol" : "ul";
            return (
              <ListTag
                key={block.id}
                className={cn(
                  "space-y-2 ml-5 text-[11px] text-gray-500 font-medium mb-4",
                  block.data.style === "ordered" ? "list-decimal" : "list-disc",
                )}
              >
                {block.data.items.map((item: any, i: number) => {
                  // Editor.js list v2 stores items as objects {content, meta, items}
                  // v1 stored them as plain strings
                  const html = typeof item === "string" ? item : (item?.content ?? "");
                  return (
                    <li
                      key={i}
                      className="pl-1"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  );
                })}
              </ListTag>
            );
          }
          case "checklist":
            return (
              <div key={block.id} className="space-y-2">
                {block.data.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-[11px] text-gray-500"
                  >
                    <div
                      className={cn(
                        "h-3 w-3 rounded border flex items-center justify-center shrink-0",
                        item.checked
                          ? "bg-primary border-primary"
                          : "bg-white border-gray-200",
                      )}
                    >
                      {item.checked && (
                        <div className="h-1.5 w-1.5 bg-secondary rounded-full" />
                      )}
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: item.text }} />
                  </div>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
