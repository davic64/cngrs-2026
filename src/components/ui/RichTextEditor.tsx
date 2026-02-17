"use client";

import * as React from "react";
import type EditorJS from "@editorjs/editorjs";

interface RichTextEditorProps {
  data: string; // JSON string
  onChange: (data: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  data,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = React.useRef<EditorJS | null>(null);
  const holderId = React.useId().replace(/:/g, "");

  React.useEffect(() => {
    let editor: EditorJS;

    const initEditor = async () => {
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;
      const Checklist = (await import("@editorjs/checklist")).default;

      let initialContent = {};
      try {
        if (data) {
          initialContent = JSON.parse(data);
        }
      } catch (e) {
        console.error("Failed to parse editor data", e);
      }

      editor = new EditorJS({
        holder: holderId,
        placeholder: placeholder || "Comienza a escribir...",
        data: initialContent as any,
        tools: {
          header: {
            class: Header as any,
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2,
            },
          },
          list: List as any,
          checklist: Checklist as any,
        },
        async onChange(api) {
          const savedData = await api.saver.save();
          onChange(JSON.stringify(savedData));
        },
      });

      editorRef.current = editor;
    };

    if (!editorRef.current) {
      initEditor();
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []); // Only run once on mount

  return (
    <div className="prose prose-sm max-w-none">
      <div
        id={holderId}
        className="min-h-[300px] bg-gray-50 border border-gray-100 rounded-2xl p-6 focus-within:border-primary/30 transition-all text-secondary"
      />
    </div>
  );
}
