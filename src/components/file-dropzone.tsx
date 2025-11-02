"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  onFiles: (files: File[]) => void;
  className?: string;
};

export function FileDropzone({ onFiles, className }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length) onFiles(acceptedFiles);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "model/stl": [".stl"],
        "model/3mf": [".3mf"],
        "application/step": [".step", ".stp"],
      },
      multiple: false,
    });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center",
        isDragActive && "bg-accent/30",
        isDragAccept && "border-green-500",
        isDragReject && "border-destructive",
        className,
      )}
      aria-label="Upload 3D model"
    >
      <input {...getInputProps()} />
      <p className="text-sm text-muted-foreground">
        Drag and drop an .stl or .3mf file here, or click to browse
      </p>
      <Button variant="outline" size="sm">Choose file</Button>
    </div>
  );
}
