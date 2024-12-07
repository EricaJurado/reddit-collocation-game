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
    <div>
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
      />
      <button disabled={!value} type="submit" onClick={handleSubmit}>
        submit
      </button>
    </div>
  );
}
