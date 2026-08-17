import {
  FileAudioIcon,
  FileCodeIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileTypeIcon,
  FileVideoIcon,
  FileWarningIcon,
} from "lucide-react";
import Image from "next/image";
import type { Attachment } from "@/lib/types";
import { Spinner } from "../ui/spinner";
import { CrossSmallIcon } from "./icons";

function getFileIcon(contentType: string, _fileType?: string) {
  if (contentType?.startsWith("image/")) {
    return null;
  }
  if (contentType?.startsWith("video/")) {
    return <FileVideoIcon className="size-8 text-purple-400" />;
  }
  if (contentType?.startsWith("audio/")) {
    return <FileAudioIcon className="size-8 text-green-400" />;
  }
  if (contentType === "application/pdf") {
    return <FileTextIcon className="size-8 text-red-400" />;
  }
  if (contentType?.includes("word") || contentType?.includes("document")) {
    return <FileTextIcon className="size-8 text-blue-400" />;
  }
  if (
    contentType?.includes("excel") ||
    contentType?.includes("spreadsheet") ||
    contentType === "text/csv"
  ) {
    return <FileSpreadsheetIcon className="size-8 text-emerald-400" />;
  }
  if (
    contentType?.includes("powerpoint") ||
    contentType?.includes("presentation")
  ) {
    return <FileTypeIcon className="size-8 text-orange-400" />;
  }
  if (contentType === "application/json") {
    return <FileCodeIcon className="size-8 text-yellow-400" />;
  }
  if (
    contentType === "text/plain" ||
    contentType === "text/markdown" ||
    contentType === "text/html"
  ) {
    return <FileTextIcon className="size-8 text-sky-400" />;
  }
  if (
    contentType?.includes("zip") ||
    contentType?.includes("tar") ||
    contentType?.includes("gzip")
  ) {
    return <FileWarningIcon className="size-8 text-amber-400" />;
  }
  if (contentType?.includes("javascript") || contentType?.includes("css")) {
    return <FileCodeIcon className="size-8 text-cyan-400" />;
  }
  return <FileIcon className="size-8 text-muted-foreground" />;
}

function getFileNameExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop()?.toUpperCase() ?? "") : "";
}

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
}) => {
  const { name, url, contentType } = attachment;
  const isImage = contentType?.startsWith("image");
  const extension = getFileNameExtension(name);

  return (
    <div
      className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted"
      data-testid="input-attachment-preview"
    >
      {isImage ? (
        <Image
          alt={name ?? "attachment"}
          className="size-full object-cover"
          height={96}
          src={url}
          width={96}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1">
          {getFileIcon(contentType)}
          {extension && (
            <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {extension}
            </span>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1.5 py-0.5 text-[9px] text-white/80 backdrop-blur-sm">
        {name}
      </div>

      {isUploading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm"
          data-testid="input-attachment-loader"
        >
          <Spinner className="size-5" />
        </div>
      )}

      {onRemove && !isUploading && (
        <button
          className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/80 group-hover:opacity-100"
          onClick={onRemove}
          type="button"
        >
          <CrossSmallIcon size={10} />
        </button>
      )}
    </div>
  );
};
