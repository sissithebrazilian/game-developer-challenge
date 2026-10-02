import { useState } from 'react'

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import './App.css'

import { GameCanvas } from './game/GameCanvas'

import {
  getMatches,
  getRanking,
  saveMatch,
} from './api/matches'

import type {
  GameSettings,
  MatchResult,
} from './types/game'

type Screen =
  | 'menu'
  | 'levels'
  | 'game'
  | 'results'
  | 'options'
  | 'ranking'
  | 'history'

const SETTINGS_KEY =
  'jungle-naval-settings'

const LEVELS = [
  { level: 1, title: 'Calm Waters', description: 'Few enemies. Mostly Chasers.', maxEnemies: 3, shooterPercent: 15 },
  { level: 2, title: 'First Contact', description: 'More Chasers enter the arena.', maxEnemies: 4, shooterPercent: 20 },
  { level: 3, title: 'Crossfire', description: 'Shooters begin appearing more often.', maxEnemies: 4, shooterPercent: 30 },
  { level: 4, title: 'Narrow Passage', description: 'More obstacles and a mixed fleet.', maxEnemies: 5, shooterPercent: 35 },
  { level: 5, title: 'Gun Line', description: 'Balanced Chasers and Shooters.', maxEnemies: 6, shooterPercent: 45 },
  { level: 6, title: 'Hunter Fleet', description: 'A larger fleet keeps constant pressure.', maxEnemies: 6, shooterPercent: 40 },
  { level: 7, title: 'Cannon Storm', description: 'Shooters become the main threat.', maxEnemies: 7, shooterPercent: 55 },
  { level: 8, title: 'Island Maze', description: 'Dense arena with many enemies.', maxEnemies: 8, shooterPercent: 50 },
  { level: 9, title: 'Pirate Armada', description: 'Large mixed fleet and little breathing room.', maxEnemies: 9, shooterPercent: 60 },
  { level: 10, title: 'Final Broadside', description: 'Maximum pressure. Shooters dominate.', maxEnemies: 10, shooterPercent: 65 },
]

function loadSettings(): GameSettings {
  const saved =
    localStorage.getItem(
      SETTINGS_KEY
    )

  if (!saved) {
    return {
      playerName: 'Player',
      duration: 90,
    }
  }

  try {
    return JSON.parse(saved)
  } catch {
    return {
      playerName: 'Player',
      duration: 90,
    }
  }
}

function App() {
  const [screen, setScreen] =
    useState<Screen>('menu')

  const [settings, setSettings] =
    useState<GameSettings>(
      loadSettings
    )

  const [
    selectedLevel,
    setSelectedLevel,
  ] =
    useState(1)

  const [
    lastResult,
    setLastResult,
  ] =
    useState<MatchResult | null>(
      null
    )

  const queryClient =
    useQueryClient()

  const {
    data: history = [],
    isLoading:
      historyLoading,
    isError:
      historyError,
  } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches,
  })

  const {
    data: ranking = [],
    isLoading:
      rankingLoading,
    isError:
      rankingError,
  } = useQuery({
    queryKey: ['ranking'],
    queryFn: getRanking,
  })

  const saveMatchMutation =
    useMutation({
      mutationFn: saveMatch,

      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['matches'],
          }),
          queryClient.invalidateQueries({
            queryKey: ['ranking'],
          }),
        ])
      },
    })

  const startGame = (
    level = selectedLevel
  ) => {
    setSelectedLevel(level)
    setScreen('game')
  }

  const handleGameOver = (
    result: MatchResult
  ) => {
    setLastResult(result)
    saveMatchMutation.mutate(result)
    setScreen('results')
  }

  const saveSettings = (
    newSettings:
      GameSettings
  ) => {
    setSettings(newSettings)

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(
        newSettings
      )
    )

    setScreen('menu')
  }

  if (screen === 'game') {
    return (
      <main className="app game-screen">
        <GameCanvas
          playerName={
            settings.playerName
          }
          duration={
            settings.duration
          }
          level={
            selectedLevel
          }
          onGameOver={
            handleGameOver
          }
          onMainMenu={() =>
            setScreen('menu')
          }
        />
      </main>
    )
  }

  if (screen === 'levels') {
    return (
      <LevelSelectScreen
        selectedLevel={
          selectedLevel
        }
        onSelect={
          setSelectedLevel
        }
        onPlay={() =>
          startGame(
            selectedLevel
          )
        }
        onBack={() =>
          setScreen('menu')
        }
      />
    )
  }

  if (screen === 'options') {
    return (
      <OptionsScreen
        settings={settings}
        onSave={
          saveSettings
        }
        onBack={() =>
          setScreen('menu')
        }
      />
    )
  }

  if (screen === 'ranking') {
    return (
      <RankingScreen
        history={ranking}
        isLoading={
          rankingLoading
        }
        isError={
          rankingError
        }
        onBack={() =>
          setScreen('menu')
        }
        onRanking={() =>
          setScreen('ranking')
        }
        onHistory={() =>
          setScreen('history')
        }
      />
    )
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        history={history}
        isLoading={
          historyLoading
        }
        isError={
          historyError
        }
        onBack={() =>
          setScreen('menu')
        }
        onRanking={() =>
          setScreen('ranking')
        }
        onHistory={() =>
          setScreen('history')
        }
      />
    )
  }

  if (
    screen === 'results' &&
    lastResult
  ) {
    return (
      <ResultsScreen
        result={
          lastResult
        }
        level={
          selectedLevel
        }
        isSaving={
          saveMatchMutation.isPending
        }
        saveError={
          saveMatchMutation.isError
        }
        onPlayAgain={() =>
          startGame(
            selectedLevel
          )
        }
        onMenu={() =>
          setScreen('menu')
        }
      />
    )
  }

  return (
    <MenuScreen
      playerName={
        settings.playerName
      }
      onPlay={() =>
        setScreen('levels')
      }
      onOptions={() =>
        setScreen('options')
      }
      onRanking={() =>
        setScreen('ranking')
      }
      onHistory={() =>
        setScreen('history')
      }
    />
  )
}

type MenuProps = {
  playerName: string
  onPlay: () => void
  onOptions: () => void
  onRanking: () => void
  onHistory: () => void
}

function MenuScreen({
  playerName,
  onPlay,
  onOptions,
  onRanking,
  onHistory,
}: MenuProps) {
  return (
    <main className="pirate-screen">
      <div className="pirate-menu-shell">
        <img
          src="/assets/png/default/ui/menu/title_pirate_battle.png"
          alt="Pirate Battle"
          className="pirate-title"
        />

        <section className="pirate-panel pirate-menu-panel">
          <p className="pirate-tagline">
            SET SAIL. TAKE COMMAND.
          </p>

          <p className="pirate-captain">
            Captain {playerName}
          </p>

          <button
            className="pirate-button pirate-button-primary"
            onClick={onPlay}
          >
            PLAY
          </button>

          <button
            className="pirate-button pirate-button-primary"
            onClick={onOptions}
          >
            OPTIONS
          </button>

          <p className="pirate-hint">
            Navigate the islands.
            Survive the battle.
          </p>

          <div className="pirate-menu-footer">
            <button
              className="pirate-button pirate-button-ranking"
              onClick={onRanking}
            >
              RANKING
            </button>

            <button
              className="pirate-button pirate-button-history"
              onClick={onHistory}
            >
              MATCH HISTORY
            </button>
          </div>
        </section>
      </div>

      <img
        className="jungle-logo"
        src="/assets/logo_jungle_gaming.svg"
        alt="Jungle Gaming"
      />
    </main>
  )
}

type LevelSelectProps = {
  selectedLevel: number
  onSelect: (
    level: number
  ) => void
  onPlay: () => void
  onBack: () => void
}

function LevelSelectScreen({
  selectedLevel,
  onSelect,
  onPlay,
  onBack,
}: LevelSelectProps) {
  const current =
    LEVELS.find(
      (item) =>
        item.level ===
        selectedLevel
    ) ?? LEVELS[0]

  return (
    <main className="pirate-screen">
      <section
        className="pirate-wide-panel"
        style={{
          maxWidth: 1080,
        }}
      >
        <h1 className="pirate-log-title">
          CHOOSE YOUR BATTLE
        </h1>

        <p className="pirate-log-subtitle">
          Select a level from 1 to 10
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(5, minmax(110px, 1fr))',
            gap: 12,
            marginBottom: 18,
          }}
        >
          {LEVELS.map(
            (item) => (
              <button
                key={
                  item.level
                }
                className="pirate-button pirate-button-secondary"
                style={{
                  width: '100%',
                  height: 58,
                  filter:
                    item.level ===
                    selectedLevel
                      ? 'brightness(1.25)'
                      : undefined,
                }}
                onClick={() =>
                  onSelect(
                    item.level
                  )
                }
              >
                LEVEL {item.level}
              </button>
            )
          )}
        </div>

        <div
          style={{
            margin:
              '0 auto 18px',
            width: 'min(620px, 100%)',
            padding:
              '18px 20px',
            borderRadius: 12,
            background:
              'rgba(4, 25, 38, 0.72)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              margin:
                '0 0 8px',
              color:
                '#ffd76f',
            }}
          >
            Level {current.level} · {current.title}
          </h2>

          <p
            style={{
              margin:
                '0 0 8px',
            }}
          >
            {current.description}
          </p>

          <p
            style={{
              margin: 0,
              opacity: 0.8,
            }}
          >
            Up to {current.maxEnemies} enemies · approximately {current.shooterPercent}% Shooters
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent:
              'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <button
            className="pirate-button pirate-button-primary"
            onClick={
              onPlay
            }
          >
            START LEVEL {selectedLevel}
          </button>

          <button
            className="pirate-button pirate-button-secondary"
            onClick={
              onBack
            }
          >
            MAIN MENU
          </button>
        </div>
      </section>

      <img
        className="jungle-logo"
        src="/assets/logo_jungle_gaming.svg"
        alt="Jungle Gaming"
      />
    </main>
  )
}

type OptionsProps = {
  settings:
    GameSettings
  onSave: (
    settings:
      GameSettings
  ) => void
  onBack: () => void
}

function OptionsScreen({
  settings,
  onSave,
  onBack,
}: OptionsProps) {
  const [
    playerName,
    setPlayerName,
  ] = useState(
    settings.playerName
  )

  const [
    duration,
    setDuration,
  ] = useState(
    settings.duration
  )

  const durationOptions =
    [
      60,
      90,
      120,
      180,
    ]

  const changeDuration = (
    direction:
      -1 | 1
  ) => {
    const index =
      durationOptions.indexOf(
        duration
      )

    const nextIndex =
      Math.max(
        0,
        Math.min(
          durationOptions.length -
            1,
          index + direction
        )
      )

    setDuration(
      durationOptions[
        nextIndex
      ]
    )
  }

  const handleSave = () => {
    const cleanName =
      playerName.trim() ||
      'Player'

    onSave({
      playerName:
        cleanName,
      duration,
    })
  }

  return (
    <main className="pirate-screen">
      <section className="pirate-panel pirate-options-panel">
        <h1 className="pirate-heading">
          OPTIONS
        </h1>

        <label className="pirate-field">
          Captain name

          <input
            value={
              playerName
            }
            maxLength={20}
            onChange={(
              event
            ) =>
              setPlayerName(
                event.target
                  .value
              )
            }
          />
        </label>

        <div className="pirate-option-control">
          <span>
            Game session
            time
          </span>

          <div className="pirate-stepper">
            <button
              className="round-control"
              onClick={() =>
                changeDuration(
                  -1
                )
              }
              aria-label="Decrease duration"
            >
              <img
                src="/assets/png/default/ui/controls/icon_minus.png"
                alt=""
              />
            </button>

            <strong>
              {duration} s
            </strong>

            <button
              className="round-control"
              onClick={() =>
                changeDuration(
                  1
                )
              }
              aria-label="Increase duration"
            >
              <img
                src="/assets/png/default/ui/controls/icon_plus.png"
                alt=""
              />
            </button>
          </div>
        </div>

        <button
          className="pirate-button pirate-button-primary"
          onClick={
            handleSave
          }
        >
          SAVE
        </button>

        <button
          className="pirate-button pirate-button-secondary"
          onClick={
            onBack
          }
        >
          MAIN MENU
        </button>
      </section>

      <img
        className="jungle-logo"
        src="/assets/logo_jungle_gaming.svg"
        alt="Jungle Gaming"
      />
    </main>
  )
}

type ResultsProps = {
  result:
    MatchResult
  level: number
  isSaving: boolean
  saveError: boolean
  onPlayAgain:
    () => void
  onMenu: () => void
}

function ResultsScreen({
  result,
  level,
  isSaving,
  saveError,
  onPlayAgain,
  onMenu,
}: ResultsProps) {
  const minutes =
    Math.floor(
      result.duration /
        60
    )

  const seconds =
    result.duration %
    60

  const formattedTime =
    `${String(
      minutes
    ).padStart(
      2,
      '0'
    )}:${String(
      seconds
    ).padStart(
      2,
      '0'
    )}`

  return (
    <main className="pirate-screen">
      <section className="pirate-panel pirate-result-panel">
        <h1 className="pirate-heading">
          BATTLE COMPLETE
        </h1>

        <p className="pirate-hint">
          LEVEL {level}
        </p>

        <div className="pirate-result-score">
          {
            result.score
          }
        </div>

        <p className="pirate-result-info">
          POINTS ·{' '}
          {
            formattedTime
          }{' '}
          ·{' '}
          {result.endedBy ===
          'Time'
            ? 'TIME UP'
            : 'DEFEATED'}
        </p>

        <button
          className="pirate-button pirate-button-primary"
          onClick={
            onPlayAgain
          }
        >
          PLAY AGAIN
        </button>

        <button
          className="pirate-button pirate-button-primary"
          onClick={
            onMenu
          }
        >
          MAIN MENU
        </button>

        {isSaving && (
          <p className="pirate-status">
            Saving match...
          </p>
        )}

        {saveError && (
          <p className="pirate-status pirate-error">
            Failed to save match.
          </p>
        )}
      </section>

      <img
        className="jungle-logo"
        src="/assets/logo_jungle_gaming.svg"
        alt="Jungle Gaming"
      />
    </main>
  )
}

type DataScreenProps = {
  history:
    MatchResult[]
  isLoading: boolean
  isError: boolean
  onBack: () => void
  onRanking:
    () => void
  onHistory:
    () => void
}

function CaptainLogHeader({
  active,
  onRanking,
  onHistory,
}: {
  active:
    | 'ranking'
    | 'history'
  onRanking:
    () => void
  onHistory:
    () => void
}) {
  return (
    <>
      <h1 className="pirate-log-title">
        CAPTAIN'S LOG
      </h1>

      <div className="pirate-log-tabs">
        <button
          className={`pirate-button pirate-button-ranking ${
            active ===
            'ranking'
              ? 'active'
              : ''
          }`}
          onClick={
            onRanking
          }
        >
          RANKING
        </button>

        <button
          className={`pirate-button pirate-button-history ${
            active ===
            'history'
              ? 'active'
              : ''
          }`}
          onClick={
            onHistory
          }
        >
          MATCH HISTORY
        </button>
      </div>
    </>
  )
}

function RankingScreen({
  history,
  isLoading,
  isError,
  onBack,
  onRanking,
  onHistory,
}: DataScreenProps) {
  return (
    <main className="pirate-screen">
      <section className="pirate-wide-panel">
        <CaptainLogHeader
          active="ranking"
          onRanking={onRanking}
          onHistory={onHistory}
        />

        <p className="pirate-log-subtitle">
          BEST CAPTAINS OF THE FLEET
        </p>

        {isLoading ? (
          <p className="pirate-status">
            Loading...
          </p>
        ) : isError ? (
          <p className="pirate-status pirate-error">
            Failed to load ranking.
          </p>
        ) : history.length ===
          0 ? (
          <p className="pirate-status">
            No matches yet.
          </p>
        ) : (
          <div className="pirate-table">
            <div className="pirate-table-row pirate-table-header">
              <span>RANK</span>
              <span>CAPTAIN</span>
              <span>POINTS</span>
              <span>PLAYED</span>
            </div>

            {history
              .slice(0, 10)
              .map(
                (
                  match,
                  index
                ) => (
                  <div
                    className="pirate-table-row"
                    key={
                      match.finishedAt +
                      index
                    }
                  >
                    <span className="rank-number">
                      {String(
                        index +
                          1
                      ).padStart(
                        2,
                        '0'
                      )}
                    </span>

                    <strong>
                      {match.playerName}
                    </strong>

                    <strong className="pirate-points">
                      {match.score}
                    </strong>

                    <span>
                      {new Date(
                        match.finishedAt
                      ).toLocaleString()}
                    </span>
                  </div>
                )
              )}
          </div>
        )}

        <button
          className="pirate-button pirate-button-primary log-menu-button"
          onClick={onBack}
        >
          MAIN MENU
        </button>
      </section>

      <img
        className="jungle-logo"
        src="/assets/logo_jungle_gaming.svg"
        alt="Jungle Gaming"
      />
    </main>
  )
}

function HistoryScreen({
  history,
  isLoading,
  isError,
  onBack,
  onRanking,
  onHistory,
}: DataScreenProps) {
  return (
    <main className="pirate-screen">
      <section className="pirate-wide-panel">
        <CaptainLogHeader
          active="history"
          onRanking={onRanking}
          onHistory={onHistory}
        />

        <p className="pirate-log-subtitle">
          YOUR RECENT BATTLES
        </p>

        {isLoading ? (
          <p className="pirate-status">
            Loading...
          </p>
        ) : isError ? (
          <p className="pirate-status pirate-error">
            Failed to load history.
          </p>
        ) : history.length ===
          0 ? (
          <p className="pirate-status">
            No matches yet.
          </p>
        ) : (
          <div className="pirate-table">
            <div className="pirate-table-row history pirate-table-header">
              <span>CAPTAIN</span>
              <span>POINTS</span>
              <span>DURATION</span>
              <span>RESULT</span>
            </div>

            {history
              .slice(0, 10)
              .map(
                (
                  match,
                  index
                ) => (
                  <div
                    className="pirate-table-row history"
                    key={
                      match.finishedAt +
                      index
                    }
                  >
                    <strong>
                      {match.playerName}
                    </strong>

                    <strong className="pirate-points">
                      {match.score}
                    </strong>

                    <span>
                      {match.duration}s
                    </span>

                    <span
                      className={
                        match.endedBy ===
                        'Time'
                          ? 'result-success'
                          : 'result-defeat'
                      }
                    >
                      {match.endedBy ===
                      'Time'
                        ? 'TIME UP'
                        : 'DEFEATED'}
                    </span>
                  </div>
                )
              )}
          </div>
        )}

        <button
          className="pirate-button pirate-button-primary log-menu-button"
          onClick={onBack}
        >
          MAIN MENU
        </button>
      </section>

      <img
        className="jungle-logo"
        src="/assets/logo_jungle_gaming.svg"
        alt="Jungle Gaming"
      />
    </main>
  )
}

export default App
