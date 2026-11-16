"use client";

interface ErrorComponentProps {
  message?: string;
}

export default function ErrorComponent({ message }: ErrorComponentProps) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-200  rounded-md p-1" role="alert">
      {message}
    </p>
  );
}
