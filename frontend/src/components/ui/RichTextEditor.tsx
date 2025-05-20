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
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            ['clean']
          ]
        }
      },
      bounds: document.body,
    });

    // Ensure we always have a function for onChange, even if it's a no-op
    const memoizedOnChange = React.useCallback((value: string) => {
      onChange?.(value);
    }, [onChange]);

    React.useEffect(() => {
      if (quill) {
        // Set initial value when quill is initialized dropdown elements
        if (value && quill.getText().trim() === '') {
          quill.clipboard.dangerouslyPasteHTML(value);
        }

        // Remove Quill branding link if it exists
        const removeQuillBranding = () => {
          const links = quill.root.querySelectorAll('a[href="https://quilljs.com"]');
          links.forEach(link => {
            const parentP = link.closest('p');
            if (parentP) {
              parentP.remove();
            } else {
              link.remove();
            }
          });
        };

        // Initial removal
        removeQuillBranding();

        const handleChange = () => {
          // Remove branding after each change
          removeQuillBranding();
          memoizedOnChange(quill.root.innerHTML);
        };

        // Handle Enter key press to submit the form
        const handleKeyDown = (event: KeyboardEvent) => {
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
          setIsFocused(true);
          // Remove branding when focused
          removeQuillBranding();
        };

        const handleBlur = () => {
          setIsFocused(false);
        };

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
          // Save current selection
          const selection = quill.getSelection();

          // Only update if the value has actually changed
          quill.clipboard.dangerouslyPasteHTML(value);

          // Restore selection if it existed
          if (selection) {
            // Ensure selection is within bounds of new content
            const contentLength = quill.getLength();
            if (selection.index < contentLength) {
              quill.setSelection(selection.index, selection.length);
            }
          }
        }
      }
    }, [quill, value]);

    // Set up the editor when it's initialized
    React.useEffect(() => {
      if (quill && !isInitialized) {
        // Mark as initialized
        setIsInitialized(true);

        // Set up the editor after a short delay to ensure it's fully rendered
        setTimeout(() => {
          try {
            // Make sure the editor is enabled and ready
            quill.enable();

            // Only focus if not in readOnly mode
            if (!readOnly) {
              quill.focus();
              setIsFocused(true);
              console.log("Editor focused and enabled on initialization");
            }

            // Force the editor to be interactive
            if (quill.root) {
              quill.root.setAttribute('contenteditable', readOnly ? 'false' : 'true');
              quill.root.style.pointerEvents = 'auto';
              quill.root.style.userSelect = 'text';
              quill.root.style.cursor = readOnly ? 'default' : 'text';
              console.log("Editor root element made explicitly editable");
            }
          } catch (error) {
            console.error("Error setting up editor:", error);
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

          // Only position cursor at the end for empty editor or if no selection exists
          if (!quill.getSelection() && quill.getText().trim() === '') {
            const length = quill.getLength();
            quill.setSelection(length, 0);
          }
        }
      }
    }, [quill, readOnly]);

    React.useImperativeHandle(ref, () => quillRef.current!, [quillRef]);

    return (
      <div
        className={cn(
          "relative border border-border guidia-rich-text-editor",
          className
        )}
        onClick={handleContainerClick}
        style={{ isolation: 'isolate' }}
      >
        <div
          ref={quillRef}
          style={{
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 1
          }}
          className="quill-editor-wrapper"
        />
        {/* Rich Text Editor styles are defined in index.css */}

        {/* Typing indicator removed */}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };