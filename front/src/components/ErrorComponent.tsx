"use client";

interface ErrorComponentProps {
  message?: string;
}

export default function ErrorComponent({ message }: ErrorComponentProps) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}
