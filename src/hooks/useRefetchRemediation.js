import { useCallback, useState } from 'react';
import { remediations } from '../api';
import { computeRebootStats } from '../store/reducers';

/***
 * Refetches remediation data outside of redux.
 * @param {object} [remediationProp] initial fetched remediation
 * @param {object} [playbookRuns] remediation data is only fetch, when there is an active playbook runs
 * @returns {remediation} refetched remediation with updated status
 */
export default function useRefetchRemediation(
  initialRemediation,
  playbookRuns,
  remediationID
) {
  const refetchRemediation = useCallback(
    (playbookRuns) => {
      const [updatedRemediation, setRemediation] = useState(initialRemediation);

      if (playbookRuns?.data?.length) {
        remediations.getRemediation(remediationID).then((result) => {
          setRemediation(computeRebootStats(result));
        });
      }

      return updatedRemediation;
    },
    [playbookRuns, initialRemediation]
  );

  return refetchRemediation;
}
