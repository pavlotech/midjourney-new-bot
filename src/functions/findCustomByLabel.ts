export default function findCustomByLabel (options: any[], label: string) {
  const foundOption = options.find(option => option.label === label);
  return foundOption ? foundOption.custom : null;
}