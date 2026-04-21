'use client';

// No hooks needed — pure derived calculation

interface SEOMetricsProps {
  text: string;
  min: number;
  max: number;
  label: string;
}

type ScoreLevel = 'empty' | 'bad' | 'okay' | 'good' | 'best';

interface ScoreConfig {
  level: ScoreLevel;
  label: string;
  badgeClass: string;
  barClass: string;
  textClass: string;
  dotClass: string;
  description: string;
}

function getScore(length: number, min: number, max: number): ScoreConfig {
  if (length === 0) {
    return {
      level: 'empty',
      label: '',
      badgeClass: '',
      barClass: 'bg-gray-200',
      textClass: 'text-gray-400',
      dotClass: 'bg-gray-300',
      description: 'Start typing to see your score',
    };
  }

  // Too short (< 60% of min)
  if (length < Math.round(min * 0.6)) {
    return {
      level: 'bad',
      label: 'Bad',
      badgeClass: 'bg-red-500/10 text-red-600 border border-red-500/20',
      barClass: 'bg-red-500',
      textClass: 'text-red-500',
      dotClass: 'bg-red-500',
      description: `Too short — needs at least ${min} characters`,
    };
  }

  // Short but approaching min (60%–99% of min)
  if (length < min) {
    return {
      level: 'okay',
      label: 'Okay',
      badgeClass: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
      barClass: 'bg-amber-400',
      textClass: 'text-amber-500',
      dotClass: 'bg-amber-400',
      description: `${min - length} more characters to reach Good`,
    };
  }

  // Perfect range
  if (length <= max) {
    // Top quartile of the range = "Best"
    const rangeSize = max - min;
    const inRange = length - min;
    if (rangeSize > 0 && inRange >= rangeSize * 0.5) {
      return {
        level: 'best',
        label: 'Best',
        badgeClass: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
        barClass: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)]',
        textClass: 'text-emerald-600',
        dotClass: 'bg-emerald-500',
        description: 'Perfectly optimised for search engines',
      };
    }
    return {
      level: 'good',
      label: 'Good',
      badgeClass: 'bg-green-500/10 text-green-700 border border-green-500/20',
      barClass: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]',
      textClass: 'text-green-600',
      dotClass: 'bg-green-500',
      description: `${max - length} more characters could be even better`,
    };
  }

  // Over the limit — bad again
  return {
    level: 'bad',
    label: 'Bad',
    badgeClass: 'bg-red-500/10 text-red-600 border border-red-500/20',
    barClass: 'bg-red-500',
    textClass: 'text-red-500',
    dotClass: 'bg-red-500',
    description: `${length - max} characters over the limit — trim it down`,
  };
}

export default function SEOMetrics({ text, min, max, label }: SEOMetricsProps) {
  const length = text?.length || 0;
  const score = getScore(length, min, max);

  // Clamp bar at 100%
  const percentage = Math.min((length / max) * 100, 100);

  return (
    <div className="space-y-2 w-full">
      {/* Top row: label + score badge + char count */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 flex-1">
          {label}
        </span>

        <div className="flex items-center gap-2">
          {/* Score badge */}
          {score.level !== 'empty' && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-sm transition-all duration-300 ${score.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${score.dotClass}`} />
              {score.label}
            </span>
          )}

          {/* Char count */}
          <span className={`text-[10px] font-black tabular-nums transition-colors ${score.textClass}`}>
            {length}
            <span className="text-gray-300 font-bold"> / {max}</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${score.barClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Hint line */}
      {score.level !== 'empty' && (
        <p className={`text-[9px] font-semibold transition-colors ${score.textClass} opacity-80`}>
          {score.description}
        </p>
      )}

      {/* Ruler ticks */}
      <div className="flex justify-between text-[8px] text-gray-300 font-bold tabular-nums pt-0.5">
        <span>0</span>
        <span className="text-gray-300">{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
