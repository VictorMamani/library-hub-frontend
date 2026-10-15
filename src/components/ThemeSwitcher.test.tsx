import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

describe('Preferencia de tema', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('cambia con el teclado y guarda la preferencia sin modificar la sesión', async () => {
    localStorage.setItem('otro-dato', 'conservar');
    document.documentElement.dataset.theme = 'light';
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' })).toHaveFocus();
    await user.keyboard(' ');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('library-hub-theme')).toBe('dark');
    expect(localStorage.getItem('otro-dato')).toBe('conservar');
    await user.keyboard('{Enter}');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('library-hub-theme')).toBe('light');
  });

  it('funciona aunque el navegador impida guardar la preferencia', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Bloqueado', 'SecurityError');
    });
    render(<ThemeSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toBeInTheDocument();
  });

  it('sincroniza el botón al recibir la preferencia de otra pestaña', () => {
    document.documentElement.dataset.theme = 'dark';
    render(<ThemeSwitcher />);
    act(() =>
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'library-hub-theme', newValue: 'light' }),
      ),
    );
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' })).toBeInTheDocument();
  });
});
