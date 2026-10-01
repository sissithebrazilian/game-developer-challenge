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
  | 'game'
  | 'results'
  | 'options'
  | 'ranking'
  | 'history'

const SETTINGS_KEY =
  'jungle-naval-settings'

// =========================
// SETTINGS
// =========================

function loadSettings(): GameSettings {
  const saved =
    localStorage.getItem(SETTINGS_KEY)

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

// =========================
// APP
// =========================

function App() {
  const [screen, setScreen] =
    useState<Screen>('menu')

  const [settings, setSettings] =
    useState<GameSettings>(
      loadSettings
    )

  const [
    lastResult,
    setLastResult,
  ] =
    useState<MatchResult | null>(
      null
    )

  const queryClient =
    useQueryClient()

  // =========================
  // MATCH HISTORY QUERY
  // =========================

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

  // =========================
  // RANKING QUERY
  // =========================

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

  // =========================
  // SAVE MATCH MUTATION
  // =========================

  const saveMatchMutation =
    useMutation({
      mutationFn: saveMatch,

      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              'matches',
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              'ranking',
            ],
          }),
        ])
      },
    })

  // =========================
  // ACTIONS
  // =========================

  const startGame = () => {
    setScreen('game')
  }

  const handleGameOver = (
    result: MatchResult
  ) => {
    setLastResult(result)

    saveMatchMutation.mutate(
      result
    )

    setScreen('results')
  }

  const saveSettings = (
    newSettings: GameSettings
  ) => {
    setSettings(newSettings)

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(newSettings)
    )

    setScreen('menu')
  }

  // =========================
  // GAME
  // =========================

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
          onGameOver={
            handleGameOver
          }
        />
      </main>
    )
  }

  // =========================
  // OPTIONS
  // =========================

  if (screen === 'options') {
    return (
      <OptionsScreen
        settings={settings}
        onSave={saveSettings}
        onBack={() =>
          setScreen('menu')
        }
      />
    )
  }

  // =========================
  // RANKING
  // =========================

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
      />
    )
  }

  // =========================
  // HISTORY
  // =========================

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
      />
    )
  }

  // =========================
  // RESULTS
  // =========================

  if (
    screen === 'results' &&
    lastResult
  ) {
    return (
      <ResultsScreen
        result={lastResult}
        isSaving={
          saveMatchMutation.isPending
        }
        saveError={
          saveMatchMutation.isError
        }
        onPlayAgain={
          startGame
        }
        onMenu={() =>
          setScreen('menu')
        }
      />
    )
  }

  // =========================
  // MENU
  // =========================

  return (
    <MenuScreen
      playerName={
        settings.playerName
      }
      onPlay={startGame}
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

// =========================
// MENU
// =========================

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
    <main className="screen">
      <section className="panel menu-panel">
        <p className="eyebrow">
          JUNGLE GAMING
        </p>

        <h1>
          Naval Battle
        </h1>

        <p className="subtitle">
          Captain {playerName}
        </p>

        <button
          className="primary-button"
          onClick={onPlay}
        >
          Play
        </button>

        <button
          onClick={onRanking}
        >
          Ranking
        </button>

        <button
          onClick={onHistory}
        >
          Match History
        </button>

        <button
          onClick={onOptions}
        >
          Options
        </button>
      </section>
    </main>
  )
}

// =========================
// OPTIONS
// =========================

type OptionsProps = {
  settings: GameSettings
  onSave: (
    settings: GameSettings
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

  const handleSave = () => {
    const cleanName =
      playerName.trim() ||
      'Player'

    onSave({
      playerName: cleanName,
      duration,
    })
  }

  return (
    <main className="screen">
      <section className="panel">
        <h1>Options</h1>

        <label>
          Player name

          <input
            value={playerName}
            maxLength={20}
            onChange={(event) =>
              setPlayerName(
                event.target.value
              )
            }
          />
        </label>

        <label>
          Match duration

          <select
            value={duration}
            onChange={(event) =>
              setDuration(
                Number(
                  event.target.value
                )
              )
            }
          >
            <option value={60}>
              60 seconds
            </option>

            <option value={90}>
              90 seconds
            </option>

            <option value={120}>
              120 seconds
            </option>

            <option value={180}>
              180 seconds
            </option>
          </select>
        </label>

        <button
          className="primary-button"
          onClick={handleSave}
        >
          Save
        </button>

        <button onClick={onBack}>
          Back
        </button>
      </section>
    </main>
  )
}

// =========================
// RESULTS
// =========================

type ResultsProps = {
  result: MatchResult
  isSaving: boolean
  saveError: boolean
  onPlayAgain: () => void
  onMenu: () => void
}

function ResultsScreen({
  result,
  isSaving,
  saveError,
  onPlayAgain,
  onMenu,
}: ResultsProps) {
  return (
    <main className="screen">
      <section className="panel">
        <p className="eyebrow">
          MATCH FINISHED
        </p>

        <h1>Results</h1>

        <div className="result-score">
          {result.score}
        </div>

        <p>
          Score
        </p>

        <div className="result-grid">
          <div>
            <strong>
              Player
            </strong>

            <span>
              {result.playerName}
            </span>
          </div>

          <div>
            <strong>
              Result
            </strong>

            <span>
              {result.endedBy ===
                'Time'
                ? 'Time Up'
                : 'Ship Destroyed'}
            </span>
          </div>

          <div>
            <strong>
              Time
            </strong>

            <span>
              {result.duration}s
            </span>
          </div>
        </div>

        {isSaving && (
          <p>
            Saving match...
          </p>
        )}

        {saveError && (
          <p>
            Failed to save match.
          </p>
        )}

        <button
          className="primary-button"
          onClick={onPlayAgain}
        >
          Play Again
        </button>

        <button onClick={onMenu}>
          Main Menu
        </button>
      </section>
    </main>
  )
}

// =========================
// DATA SCREEN TYPES
// =========================

type DataScreenProps = {
  history: MatchResult[]
  isLoading: boolean
  isError: boolean
  onBack: () => void
}

// =========================
// RANKING
// =========================

function RankingScreen({
  history,
  isLoading,
  isError,
  onBack,
}: DataScreenProps) {
  if (isLoading) {
    return (
      <main className="screen">
        <section className="panel">
          <h1>
            Ranking
          </h1>

          <p>
            Loading...
          </p>
        </section>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="screen">
        <section className="panel">
          <h1>
            Ranking
          </h1>

          <p>
            Failed to load ranking.
          </p>

          <button
            onClick={onBack}
          >
            Back
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="screen">
      <section className="panel wide-panel">
        <h1>
          Ranking
        </h1>

        {history.length === 0 ? (
          <p>
            No matches yet.
          </p>
        ) : (
          <div className="table">
            <div className="table-row table-header">
              <span>#</span>
              <span>Player</span>
              <span>Score</span>
            </div>

            {history.map(
              (match, index) => (
                <div
                  className="table-row"
                  key={
                    match.finishedAt +
                    index
                  }
                >
                  <span>
                    {index + 1}
                  </span>

                  <span>
                    {
                      match.playerName
                    }
                  </span>

                  <span>
                    {match.score}
                  </span>
                </div>
              )
            )}
          </div>
        )}

        <button
          onClick={onBack}
        >
          Back
        </button>
      </section>
    </main>
  )
}

// =========================
// MATCH HISTORY
// =========================

function HistoryScreen({
  history,
  isLoading,
  isError,
  onBack,
}: DataScreenProps) {
  if (isLoading) {
    return (
      <main className="screen">
        <section className="panel">
          <h1>
            Match History
          </h1>

          <p>
            Loading...
          </p>
        </section>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="screen">
        <section className="panel">
          <h1>
            Match History
          </h1>

          <p>
            Failed to load history.
          </p>

          <button
            onClick={onBack}
          >
            Back
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="screen">
      <section className="panel wide-panel">
        <h1>
          Match History
        </h1>

        {history.length === 0 ? (
          <p>
            No matches yet.
          </p>
        ) : (
          <div className="table">
            <div className="table-row history-row table-header">
              <span>
                Player
              </span>

              <span>
                Score
              </span>

              <span>
                Result
              </span>

              <span>
                Date
              </span>
            </div>

            {history.map(
              (match, index) => (
                <div
                  className="table-row history-row"
                  key={
                    match.finishedAt +
                    index
                  }
                >
                  <span>
                    {
                      match.playerName
                    }
                  </span>

                  <span>
                    {match.score}
                  </span>

                  <span>
                    {match.endedBy ===
                      'Time'
                      ? 'Time'
                      : 'Destroyed'}
                  </span>

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
          onClick={onBack}
        >
          Back
        </button>
      </section>
    </main>
  )
}

export default App