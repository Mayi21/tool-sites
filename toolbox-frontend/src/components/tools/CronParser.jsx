import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CronExpressionParser } from 'cron-parser';
import {
  Button, Alert, Input,
  Table, TableBody, TableCell, TableHead, TableRow
} from '../ui';
import { Copy, X } from 'lucide-react';
import useCopyWithAnimation from '../../hooks/useCopyWithAnimation.js';
import useDebouncedEffect from '../../hooks/useDebouncedEffect.js';
import CopySuccessAnimation from '../CopySuccessAnimation.jsx';

/**
 * 与原 worker 端 cronNextTimes 相同的预处理：
 * Spring 的 ? → *；Linux 5 段补秒位；校验 6-7 段
 */
function parseNextTimes(expr, count = 5) {
  let processed = expr.trim().replace(/\?/g, '*');
  if (processed.split(/\s+/).length === 5) {
    processed = '0 ' + processed;
  }
  const fields = processed.split(/\s+/).length;
  if (fields < 6 || fields > 7) {
    throw new Error('Invalid expression format. Must be 5, 6, or 7 fields.');
  }
  const interval = CronExpressionParser.parse(processed, { currentDate: new Date() });
  return Array.from({ length: count }, () => interval.next().toDate());
}

export default function CronParser() {
  const { t } = useTranslation();
  const [input, setInput] = useState('0 */20 * * * ?');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [nextExecutions, setNextExecutions] = useState([]);
  const { showAnimation, copyToClipboard, handleAnimationEnd } = useCopyWithAnimation();

  const handleClear = () => {
    setInput('');
  };

  // 纯本地解析，输入变化实时计算（不再依赖后端）
  useDebouncedEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setNextExecutions([]);
      setError('');
      return;
    }
    try {
      const times = parseNextTimes(input, 5);
      const executions = times.map((d, index) => ({ id: index, time: d.toLocaleString() }));
      setNextExecutions(executions);
      setOutput(
        `${t('Cron Expression')}: ${input}\n\n${t('Next Executions')}:\n` +
        executions.map((exec, index) => `${index + 1}. ${exec.time}`).join('\n')
      );
      setError('');
    } catch (e) {
      setNextExecutions([]);
      setOutput('');
      setError(t('Invalid cron expression: {{error}}', { error: e.message }));
    }
  }, [input]);

  return (
    <>
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t('Cron Expression Parser')}</h1>
        <p className="text-fg-secondary mb-3">
          {t('Parse cron expressions to preview next execution times and validate scheduling syntax.')}
        </p>

        {/* 工具栏：所有操作集中 */}
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div className="flex gap-1">
            <Button size="small" variant="text" onClick={handleClear} disabled={!input} startIcon={<X size={16} />}>
              {t('Clear')}
            </Button>
            <Button size="small" variant="text" onClick={() => output && copyToClipboard(output)} disabled={!output} startIcon={<Copy size={16} />}>
              {t('Copy')}
            </Button>
          </div>
        </div>

        {error && <Alert severity="error" className="mb-4">{error}</Alert>}

        {/* 左输入 / 右结果 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Input
              name="cronExpression"
              value={input}
              onChange={e => setInput(e.target.value)}
              label={t('Cron Expression')}
              placeholder="0 */20 * * * ?"
              className="font-mono"
            />
            <p className="text-sm text-fg-secondary">
              {t('Parse cron expressions to preview next execution times and validate scheduling syntax.')}
            </p>
          </div>

          <div>
            {nextExecutions.length > 0 ? (
              <Table aria-label="next executions table">
                <TableHead>
                  <TableRow>
                    <TableCell header>{t('Execution Time')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nextExecutions.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-sm">
                        {row.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded border border-line">
                <p className="text-fg-secondary">
                  {t('Next execution times will appear here. Enter a cron expression and click parse.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CopySuccessAnimation
        visible={showAnimation}
        onAnimationEnd={handleAnimationEnd}
      />
    </>
  );
}
