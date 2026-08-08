/**
 * Chat Input Component — Notion AI Inspired Floating Composer
 *
 * Rounded rectangle (18px radius, surface #FFFFFF, border #E5E7EB, soft elevation)
 * Features subtle focus ring (#4F46E5), drag & drop PDF support, and morphing Send/Stop button.
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, ArrowUp, Square, FileText, X, Sparkles, UploadCloud, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppStore } from "@/store/app-store";

interface AttachedFile {
  id: string;
  name: string;
  size: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, files?: AttachedFile[]) => void;
  onStopMessage?: () => void;
  isStreaming?: boolean;
}

export function ChatInput({
  onSendMessage,
  onStopMessage,
  isStreaming = false,
}: ChatInputProps) {
  const [text, setText] = React.useState("");
  const [attachedFiles, setAttachedFiles] = React.useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [explainabilityEnabled, setExplainabilityEnabled] = React.useState(true);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendOrStop();
    }
  };

  const handleSendOrStop = () => {
    if (isStreaming) {
      onStopMessage?.();
      return;
    }

    if (!text.trim() && attachedFiles.length === 0) return;
    onSendMessage(text.trim(), attachedFiles);
    setText("");
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const { addDocument, setUploadingFile, uploadingFile } = useAppStore();

  const uploadFileToBackend = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      setUploadingFile(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        console.error("Upload error:", err.detail);
        return;
      }
      
      const data = await res.json();
      
      // Add to global store
      addDocument({
        id: data.id,
        name: data.name,
        size: `${data.size_mb} MB`,
        type: "application/pdf",
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        groundingStatus: "High Grounding",
        evidenceChunks: data.chunks,
        citationCount: 0,
        similarityScore: 0.92,
      });
      
      // Add to attached files display
      setAttachedFiles((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          size: `${data.size_mb} MB`,
        },
      ]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((f) => uploadFileToBackend(f));
    }
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files)
        .filter((f) => f.name.toLowerCase().endsWith(".pdf"))
        .forEach((f) => uploadFileToBackend(f));
    }
  };

  const canSend = text.trim().length > 0 || attachedFiles.length > 0;

  return (
    <div className="sticky bottom-0 z-30 w-full px-6 pb-6 pt-2 bg-gradient-to-t from-[#F7F8FA] via-[#F7F8FA]/95 to-transparent">
      <div className="mx-auto max-w-[960px]">
        {/* Floating Composer: 18px Border Radius, Surface #FFFFFF, Border #E5E7EB, Focus Glow #4F46E5 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col rounded-[18px] border transition-all duration-200 ${
            isDragging
              ? "border-[#4F46E5] bg-[#EEF2FF] ring-4 ring-[#4F46E5]/20 shadow-md"
              : "border-[#E5E7EB] bg-[#FFFFFF] shadow-sm hover:border-[#D1D5DB] focus-within:border-[#4F46E5]/50 focus-within:ring-4 focus-within:ring-[#4F46E5]/10"
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[18px] bg-[#FFFFFF]/95 backdrop-blur-sm">
              <UploadCloud className="size-8 text-[#4F46E5] animate-bounce mb-2" />
              <span className="text-body font-semibold text-[#111827]">
                Drop PDFs or documents here
              </span>
              <span className="text-secondary text-[#6B7280]">
                Attach as reference sources for GlassMind XAI
              </span>
            </div>
          )}

          {/* Attached Files Chips */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-wrap gap-2 px-4 pt-3.5"
              >
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 rounded-lg bg-[#F3F5F7] border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#111827]"
                  >
                    <FileText className="size-3.5 text-[#4F46E5]" />
                    <span className="max-w-[160px] truncate font-medium">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-[#6B7280] font-mono">
                      ({file.size})
                    </span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="ml-1 rounded-full p-0.5 text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask GlassMind anything or drag & drop PDFs..."
            rows={1}
            className="w-full resize-none border-none bg-transparent px-5 pt-3.5 pb-2 text-conversation text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:ring-0 max-h-44"
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Bottom Composer Toolbar */}
          <div className="flex items-center justify-between px-3.5 pb-3 pt-1">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#6B7280] hover:bg-[#F3F5F7] hover:text-[#111827] rounded-md"
                    >
                      <Paperclip className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs bg-[#111827] text-white">
                    Attach PDF or Document
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Explainability Toggle */}
              <button
                onClick={() => setExplainabilityEnabled(!explainabilityEnabled)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-label transition-all ${
                  explainabilityEnabled
                    ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/30 font-medium"
                    : "bg-[#F3F5F7] text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                <Sparkles className="size-3" />
                <span>Explainability {explainabilityEnabled ? "On" : "Off"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-label text-[#9CA3AF]">
                Shift + Enter for new line
              </span>

              {/* Morphing Send / Stop Button */}
              <Button
                variant={isStreaming ? "destructive" : canSend ? "primary" : "secondary"}
                size="icon-sm"
                onClick={handleSendOrStop}
                disabled={!canSend && !isStreaming}
                className={`rounded-lg transition-all ${
                  isStreaming
                    ? "bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-xs"
                    : canSend
                    ? "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-xs"
                    : "bg-[#F3F5F7] text-[#9CA3AF]"
                }`}
              >
                {isStreaming ? (
                  <Square className="size-3.5 fill-current" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
