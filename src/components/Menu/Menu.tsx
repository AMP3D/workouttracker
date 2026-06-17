import { type ReactNode, useState } from 'react';
import { EllipsisVerticalIcon } from '../../assets/icons';
import './menu.scss';

interface MenuItem {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}

interface MenuProps {
  items: MenuItem[];
}

export const Menu = ({ items }: MenuProps) => {
  const [open, setOpen] = useState(false);

  const handleItemClick = (onClick: () => void) => {
    setOpen(false);
    onClick();
  };

  return (
    <div className="menu">
      <button className="header__icon-btn" onClick={() => setOpen(!open)} type="button">
        <EllipsisVerticalIcon />
      </button>

      {open && (
        <>
          <div className="menu__overlay" onClick={() => setOpen(false)} />

          <div className="menu__dropdown">
            {items.map((item, index) => (
              <button
                className="menu__item"
                key={index}
                onClick={() => handleItemClick(item.onClick)}
                type="button"
              >
                {item.icon}

                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
