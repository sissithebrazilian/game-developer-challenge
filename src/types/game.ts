
export type MatchResult = {
    playerName: string
    score: number
    duration: number
    survived: boolean
    endedBy: 'Destroyed' | 'Time'
    finishedAt: string
}

export type GameSettings = {
    playerName: string
    duration: number
}