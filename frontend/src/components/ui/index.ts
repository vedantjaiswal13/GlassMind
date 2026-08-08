/**
 * UI Components — Barrel Export
 *
 * Clean export of all GlassMind design system primitives.
 * Import from "@/components/ui" or "@ui/*" for individual components.
 */

// --- Button ---
export { Button, MotionButton, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

// --- Card ---
export {
  Card,
  MotionCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
} from "./card";
export type { CardProps } from "./card";

// --- Input ---
export { Input, inputVariants } from "./input";
export type { InputProps } from "./input";

// --- Textarea ---
export { Textarea, textareaVariants } from "./textarea";
export type { TextareaProps } from "./textarea";

// --- Modal (Dialog) ---
export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  modalContentVariants,
} from "./modal";
export type { ModalContentProps } from "./modal";

// --- Drawer ---
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "./drawer";

// --- Tooltip ---
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";

// --- Badge ---
export { Badge, badgeVariants } from "./badge";
export type { BadgeProps } from "./badge";

// --- Progress ---
export {
  Progress,
  progressTrackVariants,
  progressIndicatorVariants,
} from "./progress";
export type { ProgressProps } from "./progress";

// --- Avatar ---
export { Avatar, AvatarImage, AvatarFallback, avatarVariants } from "./avatar";
export type { AvatarProps } from "./avatar";

// --- Dropdown Menu ---
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";

// --- Command ---
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./command";

// --- Tabs ---
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
} from "./tabs";
export type { TabsListProps } from "./tabs";

// --- Accordion ---
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionItemVariants,
} from "./accordion";
export type { AccordionItemProps } from "./accordion";

// --- Scroll Area ---
export { ScrollArea, ScrollBar } from "./scroll-area";

// --- Separator ---
export { Separator, separatorVariants } from "./separator";
export type { SeparatorProps } from "./separator";

// --- Skeleton ---
export { Skeleton, skeletonVariants } from "./skeleton";
export type { SkeletonProps } from "./skeleton";
