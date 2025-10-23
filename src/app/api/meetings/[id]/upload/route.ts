import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // First, get upload URL
    const uploadUrlForm = new FormData();
    uploadUrlForm.set("filename", file.name);
    uploadUrlForm.set("contentType", file.type);

    const uploadUrlResp = await fetch(
      `${backend.replace(/\/$/, "")}/meetings/${params.id}/upload-url`,
      {
        method: "POST",
        body: uploadUrlForm,
      }
    );

    if (!uploadUrlResp.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { uploadUrl, objectUri } = await uploadUrlResp.json();

    // Upload file to the signed URL
    const uploadResp = await fetch(uploadUrl, {
      method: "PUT",
      body: await file.arrayBuffer(),
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResp.ok) {
      throw new Error("Failed to upload file");
    }

    // Set the recording with the object URI
    const recordingForm = new FormData();
    recordingForm.set("objectUri", objectUri);

    const recordingResp = await fetch(
      `${backend.replace(/\/$/, "")}/meetings/${params.id}/recording`,
      {
        method: "POST",
        body: recordingForm,
      }
    );

    const json = await recordingResp.json();
    return NextResponse.json(json, { status: recordingResp.status });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

