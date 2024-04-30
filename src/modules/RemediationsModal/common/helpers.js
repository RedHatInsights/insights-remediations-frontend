export const verifyName = (val, remediationsList) => {
  const compareData = () => {
    const trimmedVal = val.trim();
    const dataHashmap = {};
    remediationsList &&
      remediationsList.forEach((item) => {
        dataHashmap[item.name] = true;
      });

    if (dataHashmap[trimmedVal]) {
      return true;
    } else {
      return false;
    }
  };

  return compareData();
};
