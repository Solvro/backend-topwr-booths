import React from "react";

const PHOTO_LIKE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);

type AdminRecord = {
  params?: Record<string, string | undefined>;
};

const FilePreview: React.FC<{ record: AdminRecord }> = ({ record }) => {
  const id = (record?.params?.id as string | undefined) ?? "";
  const fileExtension =
    (record?.params?.fileExtension as string | undefined)?.toLowerCase() ?? "";

  const keyWithExtension =
    id.length > 0 && fileExtension.length > 0 ? `${id}.${fileExtension}` : null;
  const isPhoto =
    keyWithExtension !== null && PHOTO_LIKE_EXTENSIONS.has(fileExtension);

  return (
    <div style={{ display: "grid", gap: "10px" }}>
      <div>
        <strong>File key:</strong> {keyWithExtension ?? "-"}
      </div>
      {isPhoto ? (
        <img
          src={`/uploads/miniatures/${keyWithExtension}`}
          alt="File miniature"
          style={{
            width: "220px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginBottom: "8px",
          }}
        />
      ) : null}
      {keyWithExtension !== null ? (
        <a
          href={`/uploads/${keyWithExtension}`}
          target="_blank"
          rel="noreferrer"
        >
          Open original file
        </a>
      ) : null}
    </div>
  );
};

export default FilePreview;
