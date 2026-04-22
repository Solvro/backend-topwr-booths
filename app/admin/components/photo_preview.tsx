import React, { useEffect, useState } from "react";

type AdminProperty = {
  path: string;
};

type AdminRecord = {
  params?: Record<string, string | undefined>;
};

const PhotoPreview: React.FC<{
  property: AdminProperty;
  record: AdminRecord;
}> = ({ property, record }) => {
  const key = (record?.params?.[property.path] as string | undefined) ?? "";
  const photoKey = key.length > 0 ? key : null;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [miniatureUrl, setMiniatureUrl] = useState<string | null>(null);

  useEffect(() => {
    if (photoKey === null) {
      setImageUrl(null);
      setMiniatureUrl(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/v1/files/${photoKey}`, {
          credentials: "include",
        });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          url?: string;
          miniaturesUrl?: string;
        };

        if (!cancelled) {
          setImageUrl(payload.url ?? null);
          setMiniatureUrl(payload.miniaturesUrl ?? null);
        }
      } catch {
        if (!cancelled) {
          setImageUrl(null);
          setMiniatureUrl(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [photoKey]);

  return (
    <div style={{ display: "grid", gap: "10px" }}>
      <div>
        <strong>Photo key:</strong> {photoKey ?? "-"}
      </div>
      {miniatureUrl !== null ? (
        <img
          src={miniatureUrl}
          alt="Booth miniature"
          style={{
            width: "220px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginBottom: "8px",
          }}
        />
      ) : null}
      {imageUrl !== null ? (
        <a href={imageUrl} target="_blank" rel="noreferrer">
          Open original image
        </a>
      ) : null}
    </div>
  );
};

export default PhotoPreview;
