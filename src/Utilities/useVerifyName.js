import { useState, useEffect, useRef } from 'react';

export const useVerifyName = (name, remediationsList) => {
  const [isVerifyingName, setIsVerifyingName] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const mounted = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    mounted.current = true;
    setIsVerifyingName(true);

    //Run a timer 1 second after an input, if the user inputs again within
    //that timer, clear and reset timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const compareData = async () => {
      const dataHashmap = {};
      remediationsList &&
        remediationsList.forEach((item) => {
          dataHashmap[item.name] = true;
        });

      const foundExistingRemediation = (name) => {
        return dataHashmap[name];
      };
      foundExistingRemediation(name)
        ? setIsDisabled(true)
        : setIsDisabled(false);
    };

    timerRef.current = setTimeout(() => {
      mounted.current && compareData();
      setIsVerifyingName(false);
    }, 1000);

    return () => {
      mounted.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [name, remediationsList]);

  return [isVerifyingName, isDisabled];
};
