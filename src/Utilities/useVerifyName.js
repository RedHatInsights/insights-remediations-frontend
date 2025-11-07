import { useState, useEffect, useRef } from 'react';

const playbookNamePattern = /^(?!\s).+(?<!\s)$/;

export const useVerifyName = (name, remediationsList = []) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [dupInfo, setDupInfo] = useState({ checked: '', dup: false }); // {name we checked, isDuplicate}

  const firstRun = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    // skip the initial mount
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setIsVerifying(true);

    // clear previous timer and reset duplicate flag
    if (timerRef.current) clearTimeout(timerRef.current);
    setDupInfo({ checked: '', dup: false });

    timerRef.current = setTimeout(() => {
      const trimmed = name.trim();

      const duplicate =
        playbookNamePattern.test(trimmed) &&
        remediationsList.some((r) => r.name === trimmed);

      setDupInfo({ checked: trimmed, dup: duplicate });
      setIsVerifying(false);
    }, 500);

    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [name, remediationsList]);

  // expose duplicate status **only** if it belongs to the current value
  const isDuplicateForCurrentName =
    dupInfo.checked === name.trim() && dupInfo.dup;

  return [isVerifying, isDuplicateForCurrentName];
};
