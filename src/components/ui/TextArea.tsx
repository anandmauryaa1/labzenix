import { TextareaHTMLAttributes } from 'react';
import { Info, AlertCircle } from 'lucide-react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  info?: string;
}

export default function TextArea({ label, error, info, className = '', ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center">
            {label}
            {info && (
              <div className="group relative ml-2 cursor-help">
                <Info className="w-3 h-3 text-gray-300 hover:text-primary transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-secondary text-white text-[9px] font-bold uppercase tracking-wider rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  {info}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-secondary" />
                </div>
              </div>
            )}
          </label>
          {error && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
        </div>
      )}
      <textarea
        {...props}
        className={`px-4 py-3 border-b-2 outline-none transition-all text-sm font-medium leading-relaxed placeholder:text-gray-200 resize-none ${
          error 
            ? 'border-red-500 bg-red-50/30 text-red-900 focus:border-red-600' 
            : 'border-gray-100 bg-gray-50/50 text-secondary focus:border-primary focus:bg-white'
        } ${className}`}
      />
      {error && (
        <span className="text-[9px] font-black uppercase tracking-widest text-red-500 mt-1 flex items-center">
          {error}
        </span>
      )}
    </div>
  );
}
