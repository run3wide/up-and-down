import type { Bone } from '../domain/dinosaurs'
import { BoneArt } from './BoneArt'
import { placement } from './placement'

/** A whole skeleton laid out on its stage; `ghost` shows it as a dim outline, for a dinosaur not yet built. */
export function Skeleton({ bones, ghost = false }: { bones: readonly Bone[]; ghost?: boolean }) {
  return (
    <div className={`dig-skeleton${ghost ? ' dig-skeleton--ghost' : ''}`} aria-hidden="true">
      {bones.map((bone) => (
        <span key={bone.id} className="dig-skeleton__bone" style={placement(bone)}>
          <BoneArt kind={bone.kind} />
        </span>
      ))}
    </div>
  )
}
