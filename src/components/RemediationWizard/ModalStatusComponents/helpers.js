// Helper functions for text based on isUpdate
export const getActionText = (isUpdate, updateText, createText) =>
  isUpdate ? updateText : createText;

export const getActionNoun = (isUpdate) => (isUpdate ? 'update' : 'creation');

// Reusable Progress calculation
export const calculateProgress = (totalBatches, completedBatches) => {
  const total = totalBatches || 1;
  const completed = completedBatches || 0;
  return Math.round((completed / total) * 100);
};
