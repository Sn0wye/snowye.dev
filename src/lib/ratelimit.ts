import { type NextRequest, NextResponse } from 'next/server';

interface CacheEntry {
  requests: number[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
  identifier: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = `rate-limit:${identifier}`;
  const now = Date.now();

  const entry = cache.get(key);
  const requests = entry && entry.expiresAt > now ? entry.requests : [];
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= limit) {
    const oldestRequest = Math.min(...recentRequests);
    const reset = oldestRequest + windowMs;

    return { success: false, remaining: 0, reset };
  }

  recentRequests.push(now);
  cache.set(key, { requests: recentRequests, expiresAt: now + windowMs });

  return {
    success: true,
    remaining: limit - recentRequests.length,
    reset: now + windowMs
  };
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

export function withRateLimit(options: RateLimitOptions) {
  const { identifier, limit = 10, windowMs = 60000 } = options;

  return (
    handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
  ) =>
    async (request: NextRequest): Promise<NextResponse> => {
      const ip = getIP(request);
      const { success, remaining, reset } = await checkRateLimit(
        `${identifier} -- ${ip}`,
        limit,
        windowMs
      );

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);

        return NextResponse.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': reset.toString()
            }
          }
        );
      }

      const response = await handler(request);

      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());

      return response;
    };
}
