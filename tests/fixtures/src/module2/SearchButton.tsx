'use client';

import { useState, type DetailedHTMLProps, type HTMLAttributes } from 'react';

/**
 * Button wrapper component that triggers the KBar modal on click.
 */
export const SearchButton = ({
  children,
  ...rest
}: DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button {...rest} onClick={() => setIsOpen(!isOpen)}>
      {children}
    </button>
  );
};
