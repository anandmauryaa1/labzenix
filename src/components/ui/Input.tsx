import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        {...props}
        className="px-4 py-2 rounded-none border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
