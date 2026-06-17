import type { ReactNode } from 'react';
import './header.scss';

interface HeaderProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  subtitle?: string;
  title: string;
}

export const Header = ({ leftContent, rightContent, subtitle, title }: HeaderProps) => (
  <header className="header">
    <div className="header__left">
      {leftContent}

      <div className="header__title-group">
        <span className="header__title">{title}</span>

        {subtitle && <span className="header__subtitle">{subtitle}</span>}
      </div>
    </div>

    <div className="header__right">{rightContent}</div>
  </header>
);
