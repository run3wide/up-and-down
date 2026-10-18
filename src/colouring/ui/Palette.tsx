import { COLOURS } from '../domain/colours'

export function Palette({ chosen, onChoose }: { chosen: string; onChoose: (colour: string) => void }) {
  return (
    <div className="colouring__palette" role="group" aria-label="Colours">
      {COLOURS.map(({ id, name, hex }) => (
        <button key={id} className="colouring__swatch" style={{ background: hex }} aria-label={name} aria-pressed={chosen === id} onClick={() => onChoose(id)} />
      ))}
    </div>
  )
}
