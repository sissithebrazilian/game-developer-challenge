import {
    delay,
    http,
    HttpResponse,
} from 'msw'

import type {
    MatchResult,
} from '../types/game'

const STORAGE_KEY =
    'jungle-api-matches'

function loadMatches(): MatchResult[] {
    try {
        const saved =
            localStorage.getItem(
                STORAGE_KEY
            )

        if (!saved) return []

        return JSON.parse(saved)
    } catch {
        return []
    }
}

function persistMatches(
    matches: MatchResult[]
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(matches)
    )
}

let matches =
    loadMatches()

const processedRequests =
    new Map<string, MatchResult>()

export const handlers = [

    http.get(
        '/api/matches',
        async () => {
            await delay(300)

            return HttpResponse.json(
                matches
            )
        }
    ),


    http.get(
        '/api/ranking',
        async () => {
            await delay(300)

            const ranking = [
                ...matches,
            ]
                .sort(
                    (a, b) =>
                        b.score - a.score
                )
                .slice(0, 10)

            return HttpResponse.json(
                ranking
            )
        }
    ),


    http.post(
        '/api/matches',
        async ({ request }) => {
            await delay(400)

            const match =
                (await request.json()) as
                MatchResult

            const idempotencyKey =
                request.headers.get(
                    'Idempotency-Key'
                )

            if (
                idempotencyKey &&
                processedRequests.has(
                    idempotencyKey
                )
            ) {
                return HttpResponse.json(
                    processedRequests.get(
                        idempotencyKey
                    )
                )
            }

            if (
                !match.playerName ||
                typeof match.score !==
                'number'
            ) {
                return HttpResponse.json(
                    {
                        message:
                            'Invalid match data',
                    },
                    {
                        status: 400,
                    }
                )
            }

            matches = [
                match,
                ...matches,
            ].slice(0, 50)

            persistMatches(matches)

            if (idempotencyKey) {
                processedRequests.set(
                    idempotencyKey,
                    match
                )
            }

            return HttpResponse.json(
                match,
                {
                    status: 201,
                }
            )
        }
    ),
]