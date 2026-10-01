import { api } from './client'
import type { MatchResult } from '../types/game'

export async function getMatches() {
    const response =
        await api.get<MatchResult[]>(
            '/matches'
        )

    return response.data
}

export async function getRanking() {
    const response =
        await api.get<MatchResult[]>(
            '/ranking'
        )

    return response.data
}

export async function saveMatch(
    match: MatchResult
) {
    const idempotencyKey =
        `${match.playerName}-${match.finishedAt}`

    const response =
        await api.post<MatchResult>(
            '/matches',
            match,
            {
                headers: {
                    'Idempotency-Key':
                        idempotencyKey,
                },
            }
        )

    return response.data
}