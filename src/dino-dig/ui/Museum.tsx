import { Overlay } from '../../shared/Overlays'
import { DINOSAURS } from '../domain/dinosaurs'
import { Skeleton } from './Skeleton'

export function Museum({ collected, onClose }: { collected: readonly string[]; onClose: () => void }) {
  const complete = DINOSAURS.every((dinosaur) => collected.includes(dinosaur.id))
  return (
    <Overlay title="Museum">
      <p className="overlay__message">
        {collected.length} of {DINOSAURS.length} dinosaurs{complete ? ' - your museum is full! 🎉' : ''}
      </p>
      <ul className="dig-museum">
        {DINOSAURS.map((dinosaur) => {
          const built = collected.includes(dinosaur.id)
          return (
            <li key={dinosaur.id} className="dig-museum__exhibit" aria-label={built ? dinosaur.name : 'Not built yet'}>
              <Skeleton bones={dinosaur.bones} ghost={!built} />
              <span aria-hidden="true">{built ? dinosaur.name : '?'}</span>
            </li>
          )
        })}
      </ul>
      <button className="big-button" autoFocus onClick={onClose}>
        Back to digging
      </button>
    </Overlay>
  )
}
