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
    // Track if the editor has been initialized
    const [isInitialized, setIsInitialized] = React.useState(false);

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
      bounds: document.body,
    });

    // Ensure we always have a function for onChange, even if it's a no-op
    const memoizedOnChange = React.useCallback((value: string) => {
      onChange?.(value);
    }, [onChange]);

    React.useEffect(() => {
      if (quill) {
        // Set initial value when quill is initialized
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
    }, [quill, memoizedOnChange]);

    // Handle external value changes
    React.useEffect(() => {
      if (quill && value !== undefined) {
        const currentContent = quill.root.innerHTML;
        if (value !== currentContent) {
          // Only update if the value has actually changed
          quill.clipboard.dangerouslyPasteHTML(value);
        }
      }
    }, [quill, value]);

    // Set focus on the editor when it's initialized
    React.useEffect(() => {
      if (quill && !isInitialized && !readOnly) {
        // Mark as initialized
        setIsInitialized(true);
        // Set focus after a short delay to ensure the editor is fully rendered
        setTimeout(() => {
          quill.focus();
        }, 100);
      }
    }, [quill, isInitialized, readOnly]);

    React.useImperativeHandle(ref, () => quillRef.current!, [quillRef]);

    return (
      <div
        className={cn(
          "relative rounded-md border border-border focus-within:ring-2 focus-within:ring-[#800020] focus-within:border-brand",
          className
        )}
      >
        <div ref={quillRef} />
        {/* Rich Text Editor styles are defined in index.css */}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };


