import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/markdown",
  "text/html",
  "text/css",
  "text/javascript",
  "application/json",
  "application/xml",
  "application/zip",
  "application/x-tar",
  "application/gzip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= MAX_SIZE, {
      message: "File size should be less than 20MB",
    })
    .refine((file) => ALLOWED_TYPES.includes(file.type) || file.type === "", {
      message: "File type not supported",
    }),
});

function getFileIcon(type: string): string {
  if (type.startsWith("image/")) {
    return "image";
  }
  if (type.startsWith("video/")) {
    return "video";
  }
  if (type.startsWith("audio/")) {
    return "audio";
  }
  if (type === "application/pdf") {
    return "pdf";
  }
  if (type.includes("word") || type.includes("document")) {
    return "doc";
  }
  if (type.includes("excel") || type.includes("spreadsheet")) {
    return "xls";
  }
  if (type.includes("powerpoint") || type.includes("presentation")) {
    return "ppt";
  }
  if (type === "application/json") {
    return "json";
  }
  if (type === "text/csv") {
    return "csv";
  }
  if (type === "text/plain") {
    return "txt";
  }
  if (type === "text/markdown") {
    return "md";
  }
  if (type.includes("zip") || type.includes("tar") || type.includes("gzip")) {
    return "zip";
  }
  return "file";
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const filename = (formData.get("file") as File).name;
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileBuffer = await file.arrayBuffer();

    try {
      const data = await put(`${safeName}`, fileBuffer, {
        access: "public",
      });

      return NextResponse.json({
        ...data,
        fileType: getFileIcon(file.type),
        originalName: filename,
      });
    } catch (_error) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
