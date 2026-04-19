'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Image as ImageIcon,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Undo2,
  Redo2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
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
    <div className="border border-gray-100 rounded-none bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-100 bg-gray-50 p-4 flex flex-wrap gap-2">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded transition-all ${
            editor.isActive('bold')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded transition-all ${
            editor.isActive('italic')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-200 mx-1" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded transition-all ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded transition-all ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-200 mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded transition-all ${
            editor.isActive('bulletList')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded transition-all ${
            editor.isActive('orderedList')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-200 mx-1" />

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded transition-all ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded transition-all ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded transition-all ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-200 mx-1" />

        {/* Quote */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded transition-all ${
            editor.isActive('blockquote')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 hover:border-primary'
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* Media & Links */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded bg-white border border-gray-200 hover:border-primary transition-all"
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
          onClick={addLink}
          className="p-2 rounded bg-white border border-gray-200 hover:border-primary transition-all"
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <div className="border-l border-gray-200 mx-1" />

        {/* History */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded bg-white border border-gray-200 hover:border-primary transition-all disabled:opacity-50"
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded bg-white border border-gray-200 hover:border-primary transition-all disabled:opacity-50"
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="p-2.5 min-h-[500px] max-h-[600px] bg-white overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-[450px]
            prose-headings:font-black prose-headings:text-secondary
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-li:text-gray-700
            prose-img:rounded prose-img:max-w-full prose-img:h-auto
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
            prose-a:text-primary prose-a:underline"
        />
      </div>
    </div>
  );
}
