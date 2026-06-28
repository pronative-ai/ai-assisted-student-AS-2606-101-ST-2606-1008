import { TokenTotalsResponse, TokenSeriesResponse } from '@/types/token-usage'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function buildUrl(
  path: string,
  params: Record<string, string>
): string {
  const url = new URL(path, BASE_URL)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

export async function getTotalTokens(
  startIso: string,
  endIso: string,
  signal?: AbortSignal
): Promise<TokenTotalsResponse> {
  const url = buildUrl('/api/telemetry/tokens/total', {
    start: startIso,
    end: endIso,
  })

  const res = await fetch(url, { signal })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `Total tokens request failed (${res.status}): ${body || res.statusText}`
    )
  }

  return res.json()
}

export async function getTokenTimeseries(
  startIso: string,
  endIso: string,
  interval: string,
  signal?: AbortSignal
): Promise<TokenSeriesResponse> {
  const url = buildUrl('/api/telemetry/tokens/timeseries', {
    start: startIso,
    end: endIso,
    interval,
  })

  const res = await fetch(url, { signal })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `Token timeseries request failed (${res.status}): ${body || res.statusText}`
    )
  }

  return res.json()
}
