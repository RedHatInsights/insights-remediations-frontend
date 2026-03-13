export const CSV_TYPE = 'text/csv;charset=utf-8;';
export const JSON_TYPE = 'data:text/json;charset=utf-8,';
export const YAML_TYPE = 'text/yaml;charset=utf-8;';
export const ZIP_TYPE = 'application/zip';

export const getTooltipContent = (hasPermissions, hasSelected) => {
  if (!hasPermissions) {
    return 'You do not have correct permissions to remediate this entity.';
  }

  if (!hasSelected) {
    return 'Select one or more items from the table below.';
  }

  return null; // No tooltip needed when user has permissions and has selected items
};

export function downloadFile(
  data,
  filename = `${new Date().toISOString()}`,
  format = 'yml',
) {
  let type;
  if (format === 'json') {
    type = JSON_TYPE;
  } else if (format === 'yml' || format === 'yaml') {
    type = YAML_TYPE;
  } else if (format === 'zip') {
    type = ZIP_TYPE;
  } else {
    type = CSV_TYPE;
  }

  const blob = new Blob([data], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(format === 'zip' ? data : blob);
  link.download = `${filename}.${format}`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
}
