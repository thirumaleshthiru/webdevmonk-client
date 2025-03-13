import { useState, useRef, useEffect, useCallback } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Image, Link, Code, AlignLeft, AlignCenter, AlignRight, Type, Heading1, Heading2, Heading3, Minus } from "lucide-react";
import axiosInstance from "../utils/axiosInstance.js";
import { useAuth } from "../utils/AuthContext.jsx";

const CustomRichTextEditor = ({ value, onChange, className }) => {
  const { token } = useAuth();
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selection, setSelection] = useState(null);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  
  // Initialize editor with content
  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Save selection when editor gets focus
  const saveSelection = useCallback(() => {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        setSelection(sel.getRangeAt(0));
      }
    }
  }, []);

  // Restore selection
  const restoreSelection = useCallback(() => {
    if (selection && window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(selection);
      return true;
    }
    return false;
  }, [selection]);

  // Handle content change and notify parent
  const handleContentChange = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Apply command to editor
  const execCommand = useCallback((command, value = null) => {
    if (restoreSelection()) {
      document.execCommand(command, false, value);
      handleContentChange();
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  }, [restoreSelection, handleContentChange]);

  // Handle image upload
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append("image", file);
      
      try {
        setIsLoading(true);
        const response = await axiosInstance.post("http://localhost:7000/upload", formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (!response.data || !response.data.url) {
          throw new Error("Image upload failed");
        }
        
        const imageUrl = `http://localhost:7000/uploads/${response.data.url}`;
        if (restoreSelection()) {
          document.execCommand('insertImage', false, imageUrl);
          handleContentChange();
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Failed to upload image. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
  }, [token, restoreSelection, handleContentChange]);

  // Insert link
  const insertLink = useCallback(() => {
    const url = prompt("Enter the URL:");
    if (url && restoreSelection()) {
      document.execCommand('createLink', false, url);
      handleContentChange();
    }
  }, [restoreSelection, handleContentChange]);

  // Set heading level
  const setHeading = useCallback((level) => {
    if (restoreSelection()) {
      document.execCommand('formatBlock', false, level);
      handleContentChange();
    }
  }, [restoreSelection, handleContentChange]);

  // Handle editor paste to strip unwanted formatting
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    let text = '';
    
    if (e.clipboardData || window.clipboardData) {
      // Try to get HTML content first
      text = (e.clipboardData || window.clipboardData).getData('text/html');
      
      // If no HTML, get plain text
      if (!text) {
        text = (e.clipboardData || window.clipboardData).getData('text/plain');
      }
    }
    
    // Insert the text at the current position
    if (document.queryCommandSupported('insertHTML')) {
      document.execCommand('insertHTML', false, text);
    } else {
      document.execCommand('insertText', false, text);
    }
    
    handleContentChange();
  }, [handleContentChange]);

  return (
    <div className={`custom-editor ${className || ''}`}>
      {error && (
        <div className="p-2 mb-2 bg-red-50 text-red-500 border border-red-200 rounded">
          {error}
          <button 
            className="ml-2 text-xs" 
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-100 border-2 border-b-0 border-gray-300">
        {/* Text formatting */}
        <button 
          type="button" 
          onClick={() => execCommand('bold')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('italic')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('underline')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Underline"
        >
          <Underline size={18} />
        </button>
        
        <div className="mx-1 h-6 w-px bg-gray-300"></div>
        
        {/* Headings */}
        <button 
          type="button" 
          onClick={() => setHeading('h1')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => setHeading('h2')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => setHeading('h3')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => setHeading('p')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Paragraph"
        >
          <Type size={18} />
        </button>
        
        <div className="mx-1 h-6 w-px bg-gray-300"></div>
        
        {/* Lists */}
        <button 
          type="button" 
          onClick={() => execCommand('insertUnorderedList')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('insertOrderedList')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
        
        <div className="mx-1 h-6 w-px bg-gray-300"></div>
        
        {/* Alignment */}
        <button 
          type="button" 
          onClick={() => execCommand('justifyLeft')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('justifyCenter')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('justifyRight')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
        
        <div className="mx-1 h-6 w-px bg-gray-300"></div>
        
        {/* Media and other */}
        <button 
          type="button" 
          onClick={handleImageUpload} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Insert Image"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <Image size={18} />
          )}
        </button>
        <button 
          type="button" 
          onClick={insertLink} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Insert Link"
        >
          <Link size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('formatBlock', 'pre')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Code Block"
        >
          <Code size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => execCommand('insertHorizontalRule')} 
          className="p-1 hover:bg-gray-200 rounded"
          title="Horizontal Line"
        >
          <Minus size={18} />
        </button>
      </div>
      
      {/* Editor Area */}
      <div
        ref={editorRef}
        className="border-2 border-gray-300 p-4 min-h-96 focus:outline-none focus:border-black"
        contentEditable="true"
        onInput={handleContentChange}
        onBlur={saveSelection}
        onFocus={saveSelection}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onPaste={handlePaste}
        data-placeholder="Start typing here..."
      />
    </div>
  );
};

export default CustomRichTextEditor;