import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'

const MemoEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="memo-editor">
      {/* ツールバー */}
      <div style={{ marginBottom: '8px' }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="border border-gray-300 rounded px-2 py-1 mr-2 hover:bg-gray-100 w-8"><b>B</b></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="border border-gray-300 rounded px-2 py-1 mr-2 hover:bg-gray-100 w-8"><i>I</i></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="border border-gray-300 rounded px-2 py-1 mr-2 hover:bg-gray-100 w-8"><u>U</u></button>
        <button type="button" onClick={() => {
          const url = window.prompt('リンクのURLを入力してください');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }} className="border border-gray-300 rounded px-2 py-1 mr-2 hover:bg-gray-100 w-8">🔗</button>
        <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className="border border-gray-300 rounded px-2 py-1 hover:bg-gray-100">リンク解除</button>
      </div>


      <EditorContent
        editor={editor}
        className="border border-gray-300 rounded px-3 py-2 w-full min-h-[300px] focus:outline-none"
      />
    </div>
  )
}

export default MemoEditor
