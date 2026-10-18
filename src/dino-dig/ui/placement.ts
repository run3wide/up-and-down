import { STAGE, type Bone } from '../domain/dinosaurs'

export const placement = (bone: Bone) => ({
  left: `${(bone.x / STAGE.width) * 100}%`,
  top: `${(bone.y / STAGE.height) * 100}%`,
  width: `${(bone.width / STAGE.width) * 100}%`,
  height: `${(bone.height / STAGE.height) * 100}%`,
})
