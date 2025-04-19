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
  onEnterPress?: () => void;
  // Removed showTypingIndicator prop as it's no longer needed
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ className, value, onChange, placeholder, readOnly, onEnterPress }, ref) => {
    // Track if the editor has been initialized
    const [isInitialized, setIsInitialized] = React.useState(false);
    // Track if the editor is focused
    const [isFocused, setIsFocused] = React.useState(false);

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
        console.log("Quill initialized");

        // Set initial value when quill is initialized
        if (value && quill.getText().trim() === '') {
          quill.clipboard.dangerouslyPasteHTML(value);
        }

        const handleChange = () => {
          console.log("Text changed");
          memoizedOnChange(quill.root.innerHTML);
        };

        // Handle Enter key press to submit the form
        const handleKeyDown = (event: KeyboardEvent) => {
          console.log("Key pressed:", event.key);
          // Check if Enter is pressed without Shift (Shift+Enter creates a new line)
          if (event.key === 'Enter' && !event.shiftKey && onEnterPress) {
            // Prevent the default behavior (new line)
            event.preventDefault();
            // Call the onEnterPress callback
            onEnterPress();
          }
        };

        // Handle focus and blur events
        const handleFocus = () => {
          console.log("Editor focused via focus event");
          setIsFocused(true);
        };

        const handleBlur = () => {
          console.log("Editor blurred via blur event");
          setIsFocused(false);
        };

        // Log initial focus state
        console.log("Initial focus state:", document.activeElement === quill.root);

        // Add event listeners
        quill.on("text-change", handleChange);
        quill.root.addEventListener('keydown', handleKeyDown);
        quill.root.addEventListener('focus', handleFocus);
        quill.root.addEventListener('blur', handleBlur);

        // Cleanup function to remove the event listeners
        return () => {
          quill.off("text-change", handleChange);
          quill.root.removeEventListener('keydown', handleKeyDown);
          quill.root.removeEventListener('focus', handleFocus);
          quill.root.removeEventListener('blur', handleBlur);
        };
      }
    }, [quill, memoizedOnChange, onEnterPress, value]);

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
          try {
            // Make sure the editor is enabled and ready
            quill.enable();
            quill.focus();
            setIsFocused(true); // Also set the focus state
            console.log("Editor focused and enabled on initialization");

            // Force the editor to be interactive
            if (quill.root) {
              quill.root.setAttribute('contenteditable', 'true');
              quill.root.style.pointerEvents = 'auto';
              quill.root.style.userSelect = 'text';
              quill.root.style.cursor = 'text';
              console.log("Editor root element made explicitly editable");
            }
          } catch (error) {
            console.error("Error focusing editor:", error);
          }
        }, 300); // Increased delay to ensure DOM is ready
      }
    }, [quill, isInitialized, readOnly]);

    // Force focus on click
    const handleContainerClick = React.useCallback(() => {
      if (quill && !readOnly) {
        // Make sure the editor is enabled
        quill.enable();
        quill.focus();
        setIsFocused(true);

        // Force the editor to be interactive
        if (quill.root) {
          quill.root.setAttribute('contenteditable', 'true');
          quill.root.style.pointerEvents = 'auto';
          quill.root.style.userSelect = 'text';
          quill.root.style.cursor = 'text';

          // Try to position the cursor at the end of any content
          const length = quill.getLength();
          quill.setSelection(length, 0);
        }

        console.log("Editor focused and enabled via container click");
      }
    }, [quill, readOnly]);

    React.useImperativeHandle(ref, () => quillRef.current!, [quillRef]);

    return (
      <div
        className={cn(
          "relative border border-border",
          className
        )}
        onClick={handleContainerClick}
        style={{ zIndex: 1000 }}
      >
        <div ref={quillRef} style={{ pointerEvents: 'auto' }} />
        {/* Rich Text Editor styles are defined in index.css */}

        {/* Typing indicator removed */}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };


