import "server-only";

import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const COVER_BUCKET = "covers";
export const MAX_COVER_BYTES = 11 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionForType(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return null;
}

function objectPathFromCoverUrl(coverUrl: string) {
  const marker = `/storage/v1/object/public/${COVER_BUCKET}/`;
  const index = coverUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(coverUrl.slice(index + marker.length));
}

let bucketReady: Promise<void> | null = null;

async function ensureCoverBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase.storage.getBucket(COVER_BUCKET);
      if (data) return;

      const { error } = await supabase.storage.createBucket(COVER_BUCKET, {
        public: true,
        fileSizeLimit: MAX_COVER_BYTES,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });

      if (error && !/already exists/i.test(error.message)) {
        throw new Error("تعذّر تهيئة مخزن أغلفة الكتب.");
      }
    })().catch((error) => {
      bucketReady = null;
      throw error;
    });
  }

  await bucketReady;
}

export async function saveBookCover(userId: string, file: File) {
  if (!file.size) return null;
  if (file.size > MAX_COVER_BYTES) {
    throw new Error("حجم الصورة كبير جدًا (الحد الأقصى 11 ميغابايت).");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP.");
  }

  const ext = extensionForType(file.type);
  if (!ext) {
    throw new Error("نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP.");
  }

  await ensureCoverBucket();

  const objectPath = `${userId}/${randomUUID()}.${ext}`;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(COVER_BUCKET).upload(objectPath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error("تعذّر رفع صورة الغلاف.");
  }

  const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function deleteBookCover(coverUrl: string | null | undefined) {
  const objectPath = coverUrl ? objectPathFromCoverUrl(coverUrl) : null;
  if (!objectPath) return;

  await getSupabaseAdmin().storage.from(COVER_BUCKET).remove([objectPath]);
}

export async function parseBookCoverInput(
  formData: FormData,
  userId: string,
  existingCoverUrl: string | null | undefined,
) {
  const removeCover = formData.get("removeCover") === "on";
  const file = formData.get("cover");

  if (removeCover) {
    await deleteBookCover(existingCoverUrl);
    return null;
  }

  if (!(file instanceof File) || !file.size) {
    return existingCoverUrl ?? null;
  }

  const coverUrl = await saveBookCover(userId, file);
  if (coverUrl && existingCoverUrl && existingCoverUrl !== coverUrl) {
    await deleteBookCover(existingCoverUrl);
  }

  return coverUrl;
}
