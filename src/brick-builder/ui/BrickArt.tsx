interface BrickArtProps {
  width: number
  colour: string
}

/** A brick seen from the front, with a stud on top for each unit of width. */
export function BrickArt({ width, colour }: BrickArtProps) {
  return (
    <span className="brick" style={{ background: colour }} aria-hidden="true">
      {Array.from({ length: width }, (_, stud) => (
        <span key={stud} className="brick__stud" />
      ))}
    </span>
  )
}
