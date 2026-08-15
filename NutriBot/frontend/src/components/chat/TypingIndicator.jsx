
import { Loader2 } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shrink-0">
        <Loader2 className="h-4 w-4 text-black animate-spin" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-accent px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "200ms" }} />
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "400ms" }} />
      </div>
    </div>
  );
}