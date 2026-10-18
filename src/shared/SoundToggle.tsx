export function SoundToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button className="hud__pause" onClick={onToggle} aria-label={muted ? 'Unmute sound' : 'Mute sound'}>
      <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
    </button>
  )
}
