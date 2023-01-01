import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { SarasSectionType } from '../interfaces/testResults';
import { commas } from '../utils';
import { transformItems } from './transformItems';
import { Section } from './types';

export const transformSections = (
  sectionType: SarasSectionType,
  sarasSections: Section[],
  testHistoryId: string,
  sectionsMap: Map<string, Array<string>>,
  itemsMap: Map<string, Array<string>>,
): void => {
  const records = sarasSections.map((section) => {
    const sectionId = uuidv4();
    const items = section.Items || [];
    transformItems(sectionId, items, itemsMap);
    return mapSectionToCsvRecord(sectionId, sectionType, section, testHistoryId);
  });
  const partitionKey = dayjs().year().toString();
  if (!sectionsMap.has(partitionKey)) {
    sectionsMap.set(partitionKey, []);
  }
  records.forEach((record) => sectionsMap.get(partitionKey)?.push(record));
};

const mapSectionToCsvRecord = (sectionId: string, sectionType: SarasSectionType, section: Section, testHistoryId: string): string => {
  const versionNumber = 1;
  const startTime = section.StartTime ? `"${section.StartTime}"` : '';
  const endTime = section.EndTime ? `"${section.EndTime}"` : '';
  const order = section.Order ? `${section.Order}` : '';
  const totalScore = section.TotalScore ? `${section.TotalScore}` : '';
  const maxScore = section.MaxScore ? `${section.MaxScore}` : '';
  const sectionLabel = getSectionLabel(sectionType);
  return `\
${sectionId},\
${commas(4)}\
${sectionType},\
${commas(14)}\
${testHistoryId},\
${commas(6)}\
${sectionId},\
${startTime},\
${commas(2)}\
${order},\
${commas(3)}\
${versionNumber},\
${commas(4)}\
"${dayjs().toISOString()}",\
${totalScore},\
${commas(5)}\
"${section.Name}",\
,\
"${sectionLabel}-${order}-${section.Name}",\
${endTime},\
${maxScore},\
,`;
};

const getSectionLabel = (sectionType: SarasSectionType): string => {
  switch (sectionType) {
    case SarasSectionType.MCQ_TEST_RESULT:
      return 'MCQTestResult';
    case SarasSectionType.HPT_TEST_RESULT:
      return 'HPTTestResult';
    case SarasSectionType.TRIAL_TEST:
      return 'TrialTest';
    case SarasSectionType.SURVEY_TEST:
      return 'SurveyTest';
    default:
      throw Error('Unknown Section Type - no label found');
  }
};
