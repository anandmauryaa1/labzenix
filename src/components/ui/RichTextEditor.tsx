'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
  Image as ImageIcon,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Undo2,
  Redo2,
  Type
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Extension for Font Size removed because it's available in the tiptap package

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontSize,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (!editor.isFocused) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      editor?.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-100 rounded-none bg-white flex flex-col w-full shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-gray-100 bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
        {/* Font Size Dropdown */}
        <div className="flex items-center space-x-1 border border-gray-200 bg-white rounded px-2 py-1 mr-1">
          <Type className="w-3 h-3 text-gray-500" />
          <select 
            onChange={(e) => {
              if (e.target.value === '') {
                editor.chain().focus().unsetFontSize().run();
              } else {
                editor.chain().focus().setFontSize(e.target.value).run();
              }
            }}
            className="text-xs text-gray-700 bg-transparent outline-none cursor-pointer"
            defaultValue=""
          >
            <option value="">Size (Default)</option>
            {FONT_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="border-l border-gray-300 mx-1 h-5" />

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('bold')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('italic')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-300 mx-1 h-5" />

        {/* Paragraph & Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('paragraph')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Paragraph"
        >
          <Pilcrow className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('heading', { level: 4 })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Heading 4"
        >
          <Heading4 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('heading', { level: 5 })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Heading 5"
        >
          <Heading5 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('heading', { level: 6 })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Heading 6"
        >
          <Heading6 className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-300 mx-1 h-5" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('bulletList')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('orderedList')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-300 mx-1 h-5" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-300 mx-1 h-5" />

        {/* Quote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition-all ${
            editor.isActive('blockquote')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* Media & Links */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded bg-white border border-gray-200 hover:border-primary transition-all text-gray-700"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageUpload}
        />

        <button
          type="button"
          onClick={addLink}
          className="p-1.5 rounded bg-white border border-gray-200 hover:border-primary transition-all text-gray-700"
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-300 mx-1 h-5" />

        {/* History */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1.5 rounded bg-white border border-gray-200 hover:border-primary transition-all disabled:opacity-50 text-gray-700"
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1.5 rounded bg-white border border-gray-200 hover:border-primary transition-all disabled:opacity-50 text-gray-700"
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="p-4 min-h-[300px] bg-white overflow-y-auto" data-placeholder={placeholder || 'Start typing...'}>
        <EditorContent
          editor={editor}
          className="blog-content min-h-[250px] focus:outline-none outline-none"
        />
      </div>
    </div>
  );
}
