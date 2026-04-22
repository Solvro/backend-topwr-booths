import React, { useEffect, useState } from "react";

type AdminProperty = {
  path: string;
};

type AdminRecord = {
  params?: Record<string, string | undefined>;
};

const trimKey = (key: string): string => {
  const lastDotIndex = key.lastIndexOf(".");
  return lastDotIndex > 0 ? key.substring(0, lastDotIndex) : key;
};

const ImageUpload: React.FC<{
  property: AdminProperty;
  record: AdminRecord;
  onChange: (path: string, value: string | null) => void;
}> = ({ property, record, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [resolvedMiniatureUrl, setResolvedMiniatureUrl] = useState<
    string | null
  >(null);

  const rawValue =
    (record?.params?.[property.path] as string | undefined) ?? "";
  const fileKey = rawValue.length > 0 ? rawValue : null;

  useEffect(() => {
    if (fileKey === null) {
      setResolvedImageUrl(null);
      setResolvedMiniatureUrl(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/v1/files/${fileKey}`, {
          credentials: "include",
        });
        if (!response.ok) {
          if (!cancelled) {
            setResolvedImageUrl(null);
            setResolvedMiniatureUrl(null);
          }
          return;
        }

        const payload = (await response.json()) as {
          url?: string;
          miniaturesUrl?: string;
        };

        if (!cancelled) {
          setResolvedImageUrl(payload.url ?? null);
          setResolvedMiniatureUrl(payload.miniaturesUrl ?? null);
        }
      } catch {
        if (!cancelled) {
          setResolvedImageUrl(null);
          setResolvedMiniatureUrl(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileKey]);

  const uploadFile = async (file: File | null) => {
    if (file === null) {
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);

      const response = await fetch("/api/v1/files", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Upload failed: ${response.status}`);
      }

      const payload = (await response.json()) as { key?: string };
      if (!payload.key) {
        throw new Error("Upload response did not include key");
      }

      onChange(property.path, trimKey(payload.key));
      setResolvedImageUrl(`/uploads/${payload.key}`);
      setResolvedMiniatureUrl(`/uploads/miniatures/${payload.key}`);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Upload failed";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <label>
        Upload image
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const selected = event.currentTarget.files?.[0] ?? null;
            void uploadFile(selected);
          }}
          disabled={isUploading}
          style={{ display: "block", marginTop: "4px" }}
        />
      </label>

      <label>
        Stored key (UUID)
        <input
          type="text"
          value={fileKey ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const nextValue = event.currentTarget.value.trim();
            onChange(property.path, nextValue.length > 0 ? nextValue : null);
          }}
          placeholder="uuid (without extension)"
          style={{ width: "100%", marginTop: "4px" }}
        />
      </label>

      {isUploading ? <p style={{ margin: 0 }}>Uploading...</p> : null}
      {error !== null ? (
        <p style={{ margin: 0, color: "#d32f2f" }}>{error}</p>
      ) : null}

      {resolvedMiniatureUrl !== null ? (
        <img
          src={resolvedMiniatureUrl}
          alt="Booth miniature"
          style={{
            width: "220px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />
      ) : null}

      {resolvedImageUrl !== null ? (
        <a href={resolvedImageUrl} target="_blank" rel="noreferrer">
          Open original image
        </a>
      ) : null}
    </div>
  );
};

export default ImageUpload;
