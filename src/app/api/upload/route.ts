import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Yüklenecek dosya bulunamadı." },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (typeof file === "string") continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalName = file.name || "dosya";
      const ext = path.extname(originalName).toLowerCase();
      const randomId = crypto.randomBytes(8).toString("hex");
      const safeName = `${Date.now()}-${randomId}${ext}`;

      let fileType = "other";
      const mime = file.type.toLowerCase();
      if (mime.startsWith("image/")) {
        fileType = "image";
      } else if (mime.startsWith("video/")) {
        fileType = "video";
      } else if (
        mime.includes("pdf") ||
        mime.includes("word") ||
        mime.includes("excel") ||
        mime.includes("text") ||
        mime.includes("zip") ||
        mime.includes("rar") ||
        mime.includes("document")
      ) {
        fileType = "document";
      }

      let fileUrl = `/uploads/${safeName}`;

      // Try local file system write first; if in serverless (e.g. Vercel read-only), convert to Data URI
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, safeName);
        await writeFile(filePath, buffer);
      } catch {
        // Fallback to Base64 Data URI for serverless compatibility
        const base64 = buffer.toString("base64");
        fileUrl = `data:${file.type || "application/octet-stream"};base64,${base64}`;
      }

      uploadedFiles.push({
        fileName: originalName,
        fileUrl,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("[Upload Error]:", error);
    return NextResponse.json(
      { error: "Dosya yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
