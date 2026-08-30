"use client";

import { useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TipImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  UnderlineIcon,
  Undo2,
} from "lucide-react";

import { toast } from "sonner";

/** فشرده‌سازیِ تصویرِ آپلودی روی canvas تا مقاله سنگین نشود (حداکثر ~۱۲۸۰px، JPEG ۸۵٪) */
export async function fileToDataUrl(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1280;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no ctx");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    // اگر فرمت پشتیبانی نشد، فایلِ اصلی را می‌خوانیم
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

function Tool({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid size-9 place-items-center rounded-xl border transition ${
        active
          ? "border-gold/60 bg-gold/15 text-gold-deep dark:text-gold-soft"
          : "border-navy/10 bg-white text-navy/70 hover:border-gold/50 dark:border-gold/20 dark:bg-navy-mid dark:text-wheat"
      }`}
    >
      {children}
    </button>
  );
}

export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TipImage.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "متن مقاله را اینجا بنویسید…" }),
      TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["right", "center", "left"] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        dir: "rtl",
        class: "min-h-[22rem] rounded-2xl border border-navy/10 bg-white px-4 py-3 outline-none focus:border-gold/60 leading-[2.1] text-[0.95rem] [&_h2]:my-[1.4rem_0.6rem] [&_h2]:text-[1.25rem] [&_h2]:font-black [&_h3]:my-[1.2rem_0.5rem] [&_h3]:text-[1.05rem] [&_h3]:font-black [&_p]:my-[0.7rem] [&_p:first-child.is-editor-empty:before]:content-[attr(data-placeholder)] [&_p:first-child.is-editor-empty:before]:float-inline-start [&_p:first-child.is-editor-empty:before]:h-0 [&_p:first-child.is-editor-empty:before]:pointer-events-none [&_p:first-child.is-editor-empty:before]:text-current [&_p:first-child.is-editor-empty:before]:opacity-[0.35] [&_ul]:my-[0.7rem] [&_ul]:list-disc [&_ul]:ps-[1.4rem] [&_ol]:my-[0.7rem] [&_ol]:list-decimal [&_ol]:ps-[1.4rem] [&_li]:my-[0.3rem] [&_blockquote]:my-4 [&_blockquote]:border-s-[3px] [&_blockquote]:border-gold [&_blockquote]:ps-[0.9rem] [&_blockquote]:opacity-80 [&_blockquote]:font-semibold [&_a]:font-extrabold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-[3px] [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-[1.25rem] [&_img]:h-auto [&_strong]:font-black dark:border-gold/25 dark:bg-navy-mid/60",
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  function insertImage(src: string) {
    editor?.chain().focus().setImage({ src }).run();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("تصویر خیلی بزرگ است", { description: "حداکثر ۸ مگابایت." });
      return;
    }
    try {
      insertImage(await fileToDataUrl(file));
      toast("تصویر اضافه شد");
    } catch {
      toast.error("آپلود ناموفق بود", { description: "یک فایل تصویری دیگر امتحان کنید." });
    }
  }

  function addLink(ed: Editor | null) {
    if (!ed) return;
    const prev = ed.getAttributes("link").href as string | undefined;
    const url = window.prompt("آدرس پیوند:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      ed.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    ed.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-navy/10 bg-sand/40 dark:border-gold/25 dark:bg-navy-deep/40">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-navy/8 p-2 dark:border-gold/15">
        <Tool label="واگرد" onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </Tool>
        <Tool label="ازنو" onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </Tool>
        <span className="mx-1 h-6 w-px bg-navy/10 dark:bg-gold/20" />
        <Tool label="ضخیم" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </Tool>
        <Tool label="کج" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </Tool>
        <Tool
          label="زیرخط"
          active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </Tool>
        <span className="mx-1 h-6 w-px bg-navy/10 dark:bg-gold/20" />
        <Tool
          label="تیتر بزرگ"
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </Tool>
        <Tool
          label="تیتر کوچک"
          active={editor?.isActive("heading", { level: 3 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </Tool>
        <span className="mx-1 h-6 w-px bg-navy/10 dark:bg-gold/20" />
        <Tool
          label="فهرست نقطه‌ای"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </Tool>
        <Tool
          label="فهرست شماره‌دار"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </Tool>
        <Tool
          label="نقل‌قول"
          active={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </Tool>
        <span className="mx-1 h-6 w-px bg-navy/10 dark:bg-gold/20" />
        <Tool label="پیوند" active={editor?.isActive("link")} onClick={() => addLink(editor)}>
          <Link2 className="size-4" />
        </Tool>
        <Tool label="آپلود تصویر" onClick={() => fileRef.current?.click()}>
          <ImageIcon className="size-4" />
        </Tool>
        <span className="mx-1 h-6 w-px bg-navy/10 dark:bg-gold/20" />
        <Tool
          label="راست‌چین"
          active={editor?.isActive({ textAlign: "right" })}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </Tool>
        <Tool
          label="وسط‌چین"
          active={editor?.isActive({ textAlign: "center" })}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </Tool>
        <Tool
          label="چپ‌چین"
          active={editor?.isActive({ textAlign: "left" })}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </Tool>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>
      <div className="p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
