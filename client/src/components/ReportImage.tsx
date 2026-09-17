/**
 * ReportImage — renders a report screenshot from either the legacy inline
 * data-URL (`report.image`, synced to the cloud) or an IndexedDB blob
 * reference (`report.imageRef` → object URL, for >1.5 MB originals).
 */
import { useEffect, useState } from "react";
import { getVaultImageUrl } from "@/lib/vault";

export type ReportImageProps = {
  image?: string;
  imageRef?: string;
  alt?: string;
  className?: string;
};

export default function ReportImage({ image, imageRef, alt, className }: ReportImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBlobUrl(null);
    if (!imageRef || image) return;
    getVaultImageUrl(imageRef).then(url => {
      if (!cancelled) setBlobUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [imageRef, image]);

  const src = image || blobUrl;
  if (!src) return null;
  return <img className={className ?? "report-image"} src={src} alt={alt ?? "Report attachment"} />;
}
