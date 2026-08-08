/**
 * Search Modal Component
 *
 * Command palette search triggered by ⌘K or sidebar search button.
 * Built on CommandDialog (cmdk + Radix Dialog).
 */

"use client";

import * as React from "react";
import { Plus, MessageSquare, FileText, Settings, Sparkles } from "lucide-react";

import { useAppStore } from "@/store/app-store";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";

export function SearchModal() {
  const {
    searchModalOpen,
    setSearchModalOpen,
    conversations,
    documents,
    setActiveConversation,
    addConversation,
  } = useAppStore();

  // Keyboard shortcut listener (⌘K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen(!searchModalOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  const handleSelectConversation = (id: string, title: string) => {
    setActiveConversation(id, title);
    setSearchModalOpen(false);
  };

  const handleNewChat = () => {
    addConversation("New Conversation");
    setSearchModalOpen(false);
  };

  return (
    <CommandDialog
      open={searchModalOpen}
      onOpenChange={setSearchModalOpen}
    >
      <CommandInput placeholder="Type a command or search conversations & documents..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleNewChat}>
            <Plus className="size-4 text-primary" />
            <span>Start New Conversation</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => setSearchModalOpen(false)}>
            <Sparkles className="size-4 text-purple-400" />
            <span>Explain Reasoning Graph</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Recent Conversations">
          {conversations.map((conv) => (
            <CommandItem
              key={conv.id}
              onSelect={() => handleSelectConversation(conv.id, conv.title)}
            >
              <MessageSquare className="size-4 text-muted-foreground" />
              <span className="truncate">{conv.title}</span>
              <span className="ml-auto text-[10px] text-muted-foreground/60">
                {conv.updatedAt}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Uploaded Documents">
          {documents.map((doc) => (
            <CommandItem key={doc.id} onSelect={() => setSearchModalOpen(false)}>
              <FileText className="size-4 text-blue-400" />
              <span className="truncate">{doc.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground/60">
                {doc.size}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => setSearchModalOpen(false)}>
            <Settings className="size-4 text-muted-foreground" />
            <span>Preferences & Model Config</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
