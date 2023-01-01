import MockDate from 'mockdate';
import {
  SARASMCQSection, SARASHPTSection, SARASTrialSection, SARASSurveySection, SARASItemType,
} from '@dvsa/ftts-saras-model';
import { transformSections } from '../../../src/transformer/transformSections';
import { SarasSectionType } from '../../../src/interfaces/testResults';

const mockUUID = '820D3CA1-9DF7-4763-B239-CA8254DF3489';
jest.mock('uuid', () => ({
  v4: () => mockUUID,
}));

const mockToday = '2022-11-18T12:00:00.000Z';
MockDate.set(mockToday);

describe('transformSections', () => {
  const testHistoryId = '5247C2BB-9190-4EA2-AFDA-6F94B66FC5C4';

  describe('mcq sections', () => {
    test('for given mcq test section transforms to csv row', () => {
      const sarasSection1: SARASMCQSection = {
        Name: 'section-name',
        Order: 3,
        MaxScore: 50,
        TotalScore: 43,
        Percentage: 86,
        StartTime: '2022-11-18T08:45:00Z',
        EndTime: '2022-11-18T10:15:00Z',
        Items: [{
          Code: 'MCQSection-1-Item-1',
          Type: SARASItemType.MULTIPLE_CHOICE_STATIC,
          Version: 1.0,
          Topic: 'Road Procedure',
          Attempted: true,
          UserResponses: [
            'UserResponses1MCQTestResult{{firstName}}',
            'UserResponses2MCQTestResult{{firstName}}',
          ],
          Order: 1,
          TimeSpent: 20,
          Score: 59.01,
          CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
        },
        {
          Code: 'MCQSection-1-Item-2',
          Type: SARASItemType.MULTIPLE_CHOICE_STATIC,
          Version: 1.0,
          Topic:
            'Traffic Signs and Signals, Car Control, Pedestrians, Mechanical Knowledge',
          Attempted: true,
          UserResponses: [
            'UserResponses1MCQTestResult{{firstName}}',
            'UserResponses2MCQTestResult{{firstName}}',
          ],
          Order: 2,
          TimeSpent: 20,
          Score: 29.01,
          CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
        }],
      };
      const sarasSection2: SARASMCQSection = {
        Name: 'section-name-2',
        Order: 4,
        MaxScore: 50,
        TotalScore: 22,
        Percentage: 44,
        StartTime: '2022-11-18T08:47:00Z',
        EndTime: '2022-11-18T10:17:00Z',
        Items: [{
          Code: 'MCQSection-2-Item-1',
          Type: SARASItemType.MULTIPLE_CHOICE_STATIC,
          Version: 1.0,
          Topic: 'Driving Test, Disabilities, Law',
          Attempted: true,
          UserResponses: [
            'UserResponses1MCQTestResult{{firstName}}',
            'UserResponses2MCQTestResult{{firstName}}',
          ],
          Order: 3,
          TimeSpent: 20,
          Score: 19.03,
          CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
        },
        {
          Code: 'MCQSection-2-Item-2',
          Type: SARASItemType.MULTIPLE_CHOICE_STATIC,
          Version: 1.0,
          Topic: 'Publications, Instructional Techniques',
          Attempted: true,
          UserResponses: [
            'UserResponses1MCQTestResult{{firstName}}',
            'UserResponses2MCQTestResult{{firstName}}',
          ],
          Order: 4,
          TimeSpent: 20,
          Score: 15.03,
          CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
        }],
      };
      const sections: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const itemsMap: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const expectedSectionRow1 = `${mockUUID},,,,,${SarasSectionType.MCQ_TEST_RESULT},,,,,,,,,,,,,,,${testHistoryId},,,,,,,${mockUUID},"2022-11-18T08:45:00Z",,,3,,,,1,,,,,"${mockToday}",43,,,,,,"section-name",,"MCQTestResult-3-section-name","2022-11-18T10:15:00Z",50,,`;
      const expectedSectionRow2 = `${mockUUID},,,,,${SarasSectionType.MCQ_TEST_RESULT},,,,,,,,,,,,,,,${testHistoryId},,,,,,,${mockUUID},"2022-11-18T08:47:00Z",,,4,,,,1,,,,,"${mockToday}",22,,,,,,"section-name-2",,"MCQTestResult-4-section-name-2","2022-11-18T10:17:00Z",50,,`;

      transformSections(SarasSectionType.MCQ_TEST_RESULT, [sarasSection1, sarasSection2], testHistoryId, sections, itemsMap);

      expect(sections.get('2022')?.length).toBe(2);
      expect(sections.get('2022')).toStrictEqual([expectedSectionRow1, expectedSectionRow2]);
    });
  });

  describe('hpt sections', () => {
    test('for given hpt test section transforms to csv row', () => {
      const sarasSection1: SARASHPTSection = {
        Name: 'section-name',
        Order: 3,
        MaxScore: 50,
        TotalScore: 43,
        Percentage: 86,
        StartTime: '2022-11-18T08:45:00Z',
        EndTime: '2022-11-18T10:15:00Z',
        Items: [{
          Code: 'HPTSection-1-Item-1',
          Type: SARASItemType.HAZARD_PERCEPTION,
          Version: 1.0,
          Topic: 'Road Procedure',
          Attempted: true,
          UserResponses: [
            'UserResponses1MCQTestResult{{firstName}}',
            'UserResponses2MCQTestResult{{firstName}}',
          ],
          Order: 1,
          Score: 59.01,
        }],
      };
      const sarasSection2: SARASHPTSection = {
        Name: 'section-name-2',
        Order: 4,
        MaxScore: 50,
        TotalScore: 22,
        Percentage: 44,
        StartTime: '2022-11-18T08:47:00Z',
        EndTime: '2022-11-18T10:17:00Z',
        Items: [{
          Code: 'HPTSection-2-Item-1',
          Type: SARASItemType.HAZARD_PERCEPTION,
          Version: 1.0,
          Topic:
            'Traffic Signs and Signals, Car Control, Pedestrians, Mechanical Knowledge',
          Attempted: true,
          UserResponses: [
            'UserResponses1HPTTestResult{{firstName}}',
            'UserResponses2HPTTestResult{{firstName}}',
          ],
          Order: 2,
          Score: 29.01,
        },
        {
          Code: 'HPTSection-2-Item-2',
          Type: SARASItemType.HAZARD_PERCEPTION,
          Version: 1.0,
          Topic: 'Driving Test, Disabilities, Law',
          Attempted: true,
          UserResponses: [
            'UserResponses1HPTTestResult{{firstName}}',
            'UserResponses2HPTTestResult{{firstName}}',
          ],
          Order: 3,
          Score: 19.03,
        }],
      };
      const sectionsMap: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const itemsMap: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const expectedSectionRow1 = `${mockUUID},,,,,${SarasSectionType.HPT_TEST_RESULT},,,,,,,,,,,,,,,${testHistoryId},,,,,,,${mockUUID},"2022-11-18T08:45:00Z",,,3,,,,1,,,,,"${mockToday}",43,,,,,,"section-name",,"HPTTestResult-3-section-name","2022-11-18T10:15:00Z",50,,`;
      const expectedSectionRow2 = `${mockUUID},,,,,${SarasSectionType.HPT_TEST_RESULT},,,,,,,,,,,,,,,${testHistoryId},,,,,,,${mockUUID},"2022-11-18T08:47:00Z",,,4,,,,1,,,,,"${mockToday}",22,,,,,,"section-name-2",,"HPTTestResult-4-section-name-2","2022-11-18T10:17:00Z",50,,`;
      const expectedItemRow1 = `${mockUUID},,,,,2,True,,,,,,,,,${mockUUID},,,,,,,,,,,,,,,"HPTSection-1-Item-1",${mockUUID},59.01,,,1,"","Road Procedure",,,,1,,,,,,,"${mockToday}",,"UserResponses1MCQTestResult{{firstName}},UserResponses2MCQTestResult{{firstName}}",,,,,,,,,`;
      const expectedItemRow2 = `${mockUUID},,,,,2,True,,,,,,,,,${mockUUID},,,,,,,,,,,,,,,"HPTSection-2-Item-1",${mockUUID},29.01,,,2,"","Traffic Signs and Signals, Car Control, Pedestrians, Mechanical Knowledge",,,,1,,,,,,,"${mockToday}",,"UserResponses1HPTTestResult{{firstName}},UserResponses2HPTTestResult{{firstName}}",,,,,,,,,`;
      const expectedItemRow3 = `${mockUUID},,,,,2,True,,,,,,,,,${mockUUID},,,,,,,,,,,,,,,"HPTSection-2-Item-2",${mockUUID},19.03,,,3,"","Driving Test, Disabilities, Law",,,,1,,,,,,,"${mockToday}",,"UserResponses1HPTTestResult{{firstName}},UserResponses2HPTTestResult{{firstName}}",,,,,,,,,`;

      transformSections(SarasSectionType.HPT_TEST_RESULT, [sarasSection1, sarasSection2], testHistoryId, sectionsMap, itemsMap);

      expect(sectionsMap.get('2022')?.length).toBe(2);
      expect(sectionsMap.get('2022')).toStrictEqual([expectedSectionRow1, expectedSectionRow2]);
      expect(itemsMap.get('2022')?.length).toBe(3);
      expect(itemsMap.get('2022')).toStrictEqual([expectedItemRow1, expectedItemRow2, expectedItemRow3]);
    });
  });

  describe('trial sections', () => {
    test('for given trial test section transforms to csv row', () => {
      const sarasSection1: SARASTrialSection = {
        Name: 'section-name-1',
      };
      const sarasSection2: SARASTrialSection = {
        Name: 'section-name-2',
      };
      const sectionsMap: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const itemsMap: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const expectedSectionRow1 = `${mockUUID},,,,,${SarasSectionType.TRIAL_TEST},,,,,,,,,,,,,,,${testHistoryId},,,,,,,${mockUUID},,,,,,,,1,,,,,"${mockToday}",,,,,,,"section-name-1",,"TrialTest--section-name-1",,,,`;
      const expectedSectionRow2 = `${mockUUID},,,,,${SarasSectionType.TRIAL_TEST},,,,,,,,,,,,,,,${testHistoryId},,,,,,,${mockUUID},,,,,,,,1,,,,,"${mockToday}",,,,,,,"section-name-2",,"TrialTest--section-name-2",,,,`;

      transformSections(SarasSectionType.TRIAL_TEST, [sarasSection1, sarasSection2], testHistoryId, sectionsMap, itemsMap);

      expect(sectionsMap.get('2022')?.length).toBe(2);
      expect(sectionsMap.get('2022')).toStrictEqual([expectedSectionRow1, expectedSectionRow2]);
    });
  });

  describe('survey sections', () => {
    test('for given survey test section transforms to csv row', () => {
      const sarasSection1: SARASSurveySection = {
        Name: 'section-name-1',
      };
      const sarasSection2: SARASSurveySection = {
        Name: 'section-name-2',
      };
      const sectionsMap: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const itemsMap: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const expectedSectionRow1 = `${mockUUID},,,,,${SarasSectionType.SURVEY_TEST},,,,,,,,,,,,,,,${testHistoryId},,,,,,,${mockUUID},,,,,,,,1,,,,,"${mockToday}",,,,,,,"section-name-1",,"SurveyTest--section-name-1",,,,`;
      const expectedSectionRow2 = `${mockUUID},,,,,${SarasSectionType.SURVEY_TEST},,,,,,,,,,,,,,,${testHistoryId},,,,,,,${mockUUID},,,,,,,,1,,,,,"${mockToday}",,,,,,,"section-name-2",,"SurveyTest--section-name-2",,,,`;

      transformSections(SarasSectionType.SURVEY_TEST, [sarasSection1, sarasSection2], testHistoryId, sectionsMap, itemsMap);

      expect(sectionsMap.get('2022')?.length).toBe(2);
      expect(sectionsMap.get('2022')).toStrictEqual([expectedSectionRow1, expectedSectionRow2]);
    });
  });

  test('for given test section if partition key dont exists if will create one', () => {
    const sarasSection: SARASMCQSection = {
      Name: 'section-name',
      Order: 3,
      MaxScore: 50,
      TotalScore: 43,
      Percentage: 86,
      StartTime: '2022-11-18T08:45:00Z',
      EndTime: '2022-11-18T10:15:00Z',
    };
    const sectionsMap: Map<string, Array<string>> = new Map();
    const itemsMap: Map<string, Array<string>> = new Map();
    const expectedSectionRow = `${mockUUID},,,,,1,,,,,,,,,,,,,,,${testHistoryId},,,,,,,${mockUUID},"2022-11-18T08:45:00Z",,,3,,,,1,,,,,"${mockToday}",43,,,,,,"section-name",,"MCQTestResult-3-section-name","2022-11-18T10:15:00Z",50,,`;

    transformSections(SarasSectionType.MCQ_TEST_RESULT, [sarasSection], testHistoryId, sectionsMap, itemsMap);

    expect(sectionsMap.get('2022')?.length).toBe(1);
    expect(sectionsMap.get('2022')).toStrictEqual([expectedSectionRow]);
  });
});
