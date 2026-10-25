"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { message, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { uploadsService } from "utility/services";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type ImageUploadListProps = {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  folder?: "products" | "reviews";
  /** Called with true when an upload starts and false when the last one finishes, so a form can disable Save meanwhile. */
  onUploadingChange?: (uploading: boolean) => void;
};

export function ImageUploadList({ value = [], onChange, maxCount = 8, folder = "products", onUploadingChange }: ImageUploadListProps) {
  // Files that are still uploading, shown with a spinner in the picture-card list.
  const [pending, setPending] = useState<UploadFile[]>([]);
  // The latest saved list, so two uploads finishing close together don't overwrite each other.
  const valueRef = useRef<string[]>(value || []);
  useEffect(() => {
    valueRef.current = value || [];
  }, [value]);

  const fileList: UploadFile[] = useMemo(
    () => [
      ...(value || []).map((url) => ({ uid: url, name: url.split("/").pop() || url, status: "done" as const, url })),
      ...pending,
    ],
    [value, pending]
  );

  // Tell the parent when uploading starts and stops (only on a change, and clear it if this unmounts mid-upload).
  const lastReported = useRef(false);
  useEffect(() => {
    const uploading = pending.length > 0;
    if (uploading !== lastReported.current) {
      lastReported.current = uploading;
      onUploadingChange?.(uploading);
    }
  }, [pending.length, onUploadingChange]);
  useEffect(
    () => () => {
      if (lastReported.current) onUploadingChange?.(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    if (!file.type.startsWith("image/")) {
      message.error(`${file.name} is not an image file.`);
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      message.error(`${file.name} is larger than 5MB.`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps["customRequest"] = async (options) => {
    const file = options.file as File;
    const uid = `uploading-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setPending((list) => [...list, { uid, name: file.name, status: "uploading", percent: 50 }]);
    try {
      const { uploadUrl, publicUrl } = await uploadsService.presign({ fileName: file.name, contentType: file.type, folder });
      const response = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
      const next = [...valueRef.current, publicUrl];
      valueRef.current = next;
      onChange?.(next);
      options.onSuccess?.(publicUrl);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Upload failed");
      message.error(err.message);
      options.onError?.(err);
    } finally {
      setPending((list) => list.filter((item) => item.uid !== uid));
    }
  };

  function handleRemove(file: UploadFile) {
    if (file.status === "uploading") return false;
    onChange?.((value || []).filter((url) => url !== file.url));
  }

  return (
    <Upload listType="picture-card" fileList={fileList} beforeUpload={beforeUpload} customRequest={customRequest} onRemove={handleRemove} showUploadList={{ showPreviewIcon: true }}>
      {(value || []).length + pending.length >= maxCount ? null : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      )}
    </Upload>
  );
}
