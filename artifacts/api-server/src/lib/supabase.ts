import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = "nova-chat-uploads";

export async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET_NAME)) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 104857600,
    });
  }
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const filePath = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, { contentType: mimeType, upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadFiles(
  files: { buffer: Buffer; originalname: string; mimetype: string }[]
): Promise<{ url: string; fileName: string; mimeType: string }[]> {
  return Promise.all(
    files.map(async (f) => ({
      url: await uploadFile(f.buffer, f.originalname, f.mimetype),
      fileName: f.originalname,
      mimeType: f.mimetype,
    }))
  );
}
