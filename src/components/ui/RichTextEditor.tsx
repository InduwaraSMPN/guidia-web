import * as React from "react";
import { cn } from "../../lib/utils";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ className, value, onChange, placeholder, readOnly }, ref) => {
    const { quill, quillRef } = useQuill({
      theme: "snow",
      placeholder,
      readOnly,
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          ['link'],
          ['clean']
        ]
      },
    });

    // Ensure we always have a function for onChange, even if it's a no-op
    const memoizedOnChange = React.useCallback((value: string) => {
      onChange?.(value);
    }, [onChange]);

    React.useEffect(() => {
      if (quill) {
        // Set initial value only once when quill is initialized and the editor is empty
        if (value && quill.getText().trim() === '') {
          quill.clipboard.dangerouslyPasteHTML(value);
        }

        const handleChange = () => {
          memoizedOnChange(quill.root.innerHTML);
        };

        quill.on("text-change", handleChange);

        // Cleanup function to remove the event listener
        return () => {
          quill.off("text-change", handleChange);
        };
      }
    }, [quill, value, memoizedOnChange]);

    React.useImperativeHandle(ref, () => quillRef.current!, [quillRef]);

    return (
      <div
        className={cn(
          "relative rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-[#800020] focus-within:border-[#800020]",
          className
        )}
      >
        <div ref={quillRef} />
        <style>{`
        .ql-container {
          font-family: inherit;
          font-size: inherit;
          border: none !important;
        }
        .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        .ql-editor {
          padding: 0.75rem 1rem;
          min-height: 120px;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
