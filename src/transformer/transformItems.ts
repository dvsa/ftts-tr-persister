import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { commas } from '../utils';
import { Item } from './types';

export const transformItems = (
  sectionId: string,
  items: Item[],
  itemsMap: Map<string, Array<string>>,
): void => {
  if (!items.length) return;

  const partitionKey = dayjs().year().toString();
  if (!itemsMap.has(partitionKey)) {
    itemsMap.set(partitionKey, []);
  }

  const records = items.map((item) => {
    if (item && item.Code) {
      return mapItemToCsvRecord(sectionId, item);
    }
    return '';
  });

  records.forEach((record) => itemsMap.get(partitionKey)?.push(record));
};

const mapItemToCsvRecord = (sectionId: string, item: Item): string => {
  const itemId = uuidv4();
  const versionNumber = 1;
  return `\
${itemId},\
${commas(4)}\
${item.Type !== undefined && item.Type + 1},\
${item.Attempted ? 'True' : 'False'},\
${commas(8)}\
${sectionId},\
${commas(14)}\
"${item.Code || ''}",\
${itemId},\
${item.Score || ''},\
${commas(2)}\
${item.Order || ''},\
"${item.CorrectChoice || ''}",\
"${item.Topic || ''}",\
${commas(3)}\
${versionNumber},\
${commas(6)}\
"${dayjs().toISOString()}",\
,\
"${item.UserResponses || ''}",\
${commas(8)}\
`;
};
