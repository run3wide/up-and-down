import { createContext } from 'react'

/** What a game's `FrameControls` need from the frame around it. */
export interface FrameContextValue {
  /** The bar's slot for the game's own buttons; null until the frame has mounted. */
  controlsSlot: HTMLElement | null
  /** True while the "Leave game?" card is up. */
  leaving: boolean
}

export const FrameContext = createContext<FrameContextValue | null>(null)
