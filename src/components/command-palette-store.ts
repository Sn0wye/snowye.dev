import { create } from 'zustand';

type CommandPaletteState = {
  isOpen: boolean;
  toggle: () => void;
  setIsOpen: (isOpen: boolean) => void;
};

/**
 * Open state for the command palette, kept apart from the palette itself so
 * that opening it from a button does not pull cmdk and the Lottie icons into
 * the page's bundle.
 */
export const useCommandPalette = create<CommandPaletteState>(set => ({
  isOpen: false,
  setIsOpen: isOpen => set({ isOpen }),
  toggle: () => set(state => ({ isOpen: !state.isOpen }))
}));
