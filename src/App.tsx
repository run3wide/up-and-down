import type { SoundPlayer } from './shared/sound/SoundPlayer'
import { VolcanoScreen } from './lemon-volcano/ui/VolcanoScreen'
import { MAZE_LEVELS } from './cookie-maze/domain/levels'
import { MazeScreen } from './cookie-maze/ui/MazeScreen'
import { mathQuiz } from './dino-race/domain/mathQuestions'
import { RaceScreen } from './dino-race/ui/RaceScreen'
import { KitchenScreen } from './little-chef/ui/KitchenScreen'
import { MatchScreen } from './match-up/ui/MatchScreen'
import type { CollectionStore } from './dino-dig/application/CollectionStore'
import { DigScreen } from './dino-dig/ui/DigScreen'
import type { GalleryStore } from './colouring/application/GalleryStore'
import { BuilderScreen } from './brick-builder/ui/BuilderScreen'
import { ColouringScreen } from './colouring/ui/ColouringScreen'
import { SpellingScreen } from './spelling-bee/ui/SpellingScreen'
import { TicTacToeScreen } from './tic-tac-toe/ui/TicTacToeScreen'
import { useRoute } from './routing/useRoute'
import type { BestScoreStore } from './shared/bestScore'
import { SplashScreen } from './splash/SplashScreen'
import type { GameId } from './splash/games'
import { GameScreen } from './up-and-down/ui/GameScreen'

type Random = () => number

interface AppProps {
  random: Random
  /** Colouring is not scored, so it has no best score. */
  bestScores: Record<Exclude<GameId, 'colouring' | 'brick-builder'>, BestScoreStore>
  sound: SoundPlayer
  dinoDigCollection: CollectionStore
  colouringGallery: GalleryStore
  /** Where the app is served from, so each game has its own address under it. */
  basePath: string
}

export function App({ random, bestScores, sound, dinoDigCollection, colouringGallery, basePath }: AppProps) {
  const [playing, navigate] = useRoute(basePath)
  const backToGames = () => navigate(null)
  const openGame = (game: GameId) => {
    sound.unlock()
    navigate(game)
  }

  switch (playing) {
    case 'up-and-down':
      return <GameScreen random={random} bestScores={bestScores['up-and-down']} sound={sound} onExit={backToGames} />
    case 'lemon-volcano':
      return <VolcanoScreen random={random} bestScores={bestScores['lemon-volcano']} sound={sound} onExit={backToGames} />
    case 'dino-race':
      return <RaceScreen random={random} bestScores={bestScores['dino-race']} sound={sound} createQuiz={() => mathQuiz(random)} onExit={backToGames} />
    case 'little-chef':
      return <KitchenScreen random={random} bestScores={bestScores['little-chef']} onExit={backToGames} />
    case 'match-up':
      return <MatchScreen random={random} bestScores={bestScores['match-up']} onExit={backToGames} />
    case 'cookie-maze':
      return <MazeScreen levels={MAZE_LEVELS} bestScores={bestScores['cookie-maze']} sound={sound} onExit={backToGames} />
    case 'tic-tac-toe':
      return <TicTacToeScreen random={random} bestScores={bestScores['tic-tac-toe']} sound={sound} onExit={backToGames} />
    case 'spelling-bee':
      return <SpellingScreen random={random} bestScores={bestScores['spelling-bee']} sound={sound} onExit={backToGames} />
    case 'dino-dig':
      return <DigScreen random={random} bestScores={bestScores['dino-dig']} collection={dinoDigCollection} sound={sound} onExit={backToGames} />
    case 'colouring':
      return <ColouringScreen gallery={colouringGallery} onExit={backToGames} />
    case 'brick-builder':
      return <BuilderScreen onExit={backToGames} />
    case null:
      return <SplashScreen onPick={openGame} />
  }
}
