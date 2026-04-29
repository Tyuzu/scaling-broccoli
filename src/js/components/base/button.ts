import { createElement } from '../utils/createElement';

interface ButtonProps {
  label?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  variant?: string;
  onClick?: (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
}

export function Button({
  label = 'Button',
  id,
  className,
  disabled = false,
  variant = 'default',
  onClick
}: ButtonProps = {}): HTMLButtonElement {
  return createElement('button', {
    id,
    class: className,
    classes: ['btn', `btn-${variant}`],
    props: {
      disabled // use the actual prop
    },
    attrs: {
      type: 'button'
    },
    on: {
      click: onClick
    },
    children: label
  });
}