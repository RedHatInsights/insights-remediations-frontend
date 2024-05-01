import { useState, useEffect, useRef } from 'react';

export const useVerifyName = (name, remediationsList) => {
  const [isVerifyingName, setIsVerifyingName] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const mounted = useRef(false);
  const timerRef = useRef(null);
  const playbookNamePattern = /^(?!\s).+(?<!\s)$/;

  useEffect(() => {
    mounted.current = true;
    setIsVerifyingName(true);

    //Run a timer 1/2 second after an input, if the user inputs again within
    //that timer, clear and reset timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const compareData = async () => {
      const trimmedVal = name.trim();

      const dataHashmap = {};
      remediationsList &&
        remediationsList.forEach((item) => {
          dataHashmap[item.name] = true;
        });

      if (dataHashmap[trimmedVal] && playbookNamePattern.test(trimmedVal)) {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }
    };

    timerRef.current = setTimeout(() => {
      mounted.current && compareData();
      setIsVerifyingName(false);
    }, 500);

    return () => {
      mounted.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [name, remediationsList]);

  return [isVerifyingName, isDisabled];
};
