import { useState } from "react";
import { HeartPulse, Copy, Check,FileText,Image as ImageIcon,AlertTriangle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const isEmergency =
    !isUser && message.content?.includes("⚠️");

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      className={`flex gap-2.5 animate-slide-up ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
          isUser
            ? "bg-foreground text-background"
            : "gradient-primary"
        }`}
      >
        {isUser ? (
          <span className="text-xs font-bold">You</span>
        ) : (
          <HeartPulse className="h-4 w-4 text-black" />
        )}
      </div>

      <div
        className={`group flex flex-col gap-1 max-w-[80%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-foreground text-background rounded-tr-sm"
              : "bg-accent rounded-tl-sm"
          } ${
            isEmergency
              ? "ring-2 ring-destructive/50"
              : ""
          }`}
        >
          {message.file_url && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-background/50 p-2 text-xs">
              {message.file_type?.startsWith("image") ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}

              <span className="truncate">
                {message.file_name}
              </span>
            </div>
          )}

          {isEmergency && (
            <div className="mb-2 flex items-center gap-1.5 text-destructive font-semibold text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Emergency Detected — Seek Immediate Help
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="markdown-content max-w-none text-sm">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <button
            type="button"
            onClick={handleCopy}
            className="h-7 px-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <Copy className="h-3 w-3 mr-1" />
            )}

            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}