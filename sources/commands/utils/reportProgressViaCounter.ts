import { Report, StreamReport } from '@yarnpkg/core';

/**
 * A report progress via counter helper.
 *
 * @param report the report where we will report the progress
 * @param data the data that we need to loop through
 * @param each the function to run on each data entry
 * @param parallel how many entry we will process on each loop
 */
async function reportProgressViaCounter<Entry, ReturnValue, ReportType extends Report = StreamReport> (
  report: ReportType,
  data: Entry[],
  each: (entry: Entry, index: number, array: Entry[]) => Promise<ReturnValue>,
  parallel = 5
): Promise<ReturnValue[]> {
  parallel = Math.max(1, Math.floor(parallel));
  const progress = Report.progressViaCounter(Math.ceil(data.length / parallel));
  const reportedProgress = report.reportProgress(progress);

  const returnValue: ReturnValue[] = [];

  try {
    for (let index = 0; index < data.length; index += parallel) {
      const returnedValue = await Promise.all(data.slice(index, parallel).map(each));
      returnValue.push(...returnedValue);
      progress.tick(parallel);
    }

    await reportedProgress;
  } catch (error) {
    reportedProgress.stop();
    throw error;
  }

  return returnValue;
}

export default reportProgressViaCounter;
