import { useRef, useState } from 'react';

export function CustomInput({
  onChange,
  onSubmit,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onSubmit && onSubmit();
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="relative mx-auto h-12 w-full max-w-xl overflow-hidden rounded-full bg-gray-50 bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200 dark:bg-zinc-800">
      <input
        onChange={(e) => {
          setValue(e.target.value);
          onChange && onChange(e);
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={value}
        type="text"
        autoCorrect="off"
        className="relative z-50 h-full w-full rounded-full border-none bg-transparent pl-4 pr-20 text-sm text-black text-transparent focus:outline-none focus:ring-0 sm:pl-10 sm:text-base dark:text-transparent dark:text-white"
      />

      <button
        disabled={!value}
        type="submit"
        className="absolute right-2 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black transition duration-200 disabled:bg-gray-100 dark:bg-zinc-900 dark:disabled:bg-zinc-800"
        onClick={handleSubmit}
      >
        submit
      </button>
    </div>
  );
}
