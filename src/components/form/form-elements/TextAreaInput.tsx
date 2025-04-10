import { ChangeEvent } from "react";

interface TextAreaInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

export default function TextAreaInput({ value, onChange, className }: TextAreaInputProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      className={`w-full rounded-lg border p-3 focus:border-primary-500 focus:outline-none
        border-gray-300 bg-white text-gray-900
        dark:border-gray-700 dark:bg-gray-800 dark:text-white
        ${className || ''}`}
      placeholder="Type your message..."
    />
  );
}
