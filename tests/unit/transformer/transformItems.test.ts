import MockDate from 'mockdate';
import { SARASGender, SARASItemType, SARASResultBody } from '@dvsa/ftts-saras-model';
import { transformItems } from '../../../src/transformer/transformItems';

const mockUUID = '820D3CA1-9DF7-4763-B239-CA8254DF3489';
jest.mock('uuid', () => ({
  v4: () => mockUUID,
}));

const mockToday = '2022-11-18T12:00:00.000Z';
MockDate.set(mockToday);

describe('transformItems', () => {
  const data: Partial<SARASResultBody> = {
    TestInformation: {
      OverallStatus: 1,
      CertificationID: 'ABCDEFGHI',
      WorkStation: 'Windows',
      WorkStationPerformance: {
        CPU: 76,
        RAM: 55,
      },
      StartTime: '2020-07-24T10:05:00Z',
      EndTime: '2020-07-24T10:10:00Z',
      Invigilator: 'Hannah',
      DeliveryMode: 3,
      TextLanguage: 1,
      AccommodationType: [12, 10],
      ColourFormat: 0,
      VoiceOverLanguage: 7,
      TestType: 11,
      CertificateExpiryDate: '2025-07-24T23:00:00Z',
    },
    Appointment: {
      DateTime: '2020-07-24T10:00:00Z',
    },
    Candidate: {
      CandidateID: '9bca9dbe-1ac8-ea11-a812-000d3a7f128d',
      DOB: '01/01/1960',
      DrivingLicenseNumber: '1234123412341234',
      Gender: SARASGender.OTHER,
      Name: 'Test',
      Surname: 'Tester',
    },
    Admission: {
      DateTime: '2020-07-24T10:01:00Z',
      AdmittedBy: 'Prem',
      CandidatePhoto: 'www.google.com',
      CandidateSignature: 'www.google.co.uk',
    },
    MCQTestResult: {
      FormID: 'MCQTestResultFormID{{firstName}}',
      TestScore: 60.6,
      TotalScore: 90.07,
      Percentage: 70.999,
      ResultStatus: 0,
      Sections: [
        {
          Name: 'MCQSection-1',
          Order: 35,
          MaxScore: 100.09,
          TotalScore: 85.009,
          Percentage: 78.9,
          StartTime: '{{admissionDate}}T09:00:02Z',
          EndTime: '{{admissionDate}}T10:20:02Z',
          Items: [
            {
              Code: 'MCQSection-1-Item-1',
              Type: SARASItemType.MULTIPLE_CHOICE_STATIC,
              Version: 1.0,
              Topic: 'Road Procedure',
              Attempted: false,
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
            },
            {
              Code: 'MCQSection-1-Item-3',
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
              Code: 'MCQSection-1-Item-4',
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
            },
          ],
        },
        {
          Name: 'MCQSection-2',
          Order: 35,
          MaxScore: 100.09,
          TotalScore: 85.009,
          Percentage: 78.9,
          StartTime: '{{admissionDate}}T09:00:02Z',
          EndTime: '{{admissionDate}}T10:20:02Z',
          Items: [
            {
              Code: 'MCQSection-2-Item-1',
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
              Score: 10.01,
              CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
            },
            {
              Code: 'MCQSection-2-Item-2',
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
              Score: 11.01,
              CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
            },
            {
              Code: 'MCQSection-2-Item-3',
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
              Code: 'MCQSection-2-Item-4',
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
              Score: 19.03,
              CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
            },
          ],
        },
        {
          Name: 'MCQSection-3',
          Order: 35,
          MaxScore: 100.09,
          TotalScore: 85.009,
          Percentage: 78.9,
          StartTime: '{{admissionDate}}T09:00:02Z',
          EndTime: '{{admissionDate}}T10:20:02Z',
          Items: [
            {
              Code: 'MCQSection-3-Item-1',
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
              Score: 10.01,
              CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
            },
            {
              Code: 'MCQSection-3-Item-2',
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
              Score: 11.01,
              CorrectChoice: ['CorrectChoiceMCQTestResult{{firstName}}'],
            },
            {
              Code: 'MCQSection-3-Item-3',
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
          ],
        },
      ],
    },
    HPTTestResult: {
      FormID: 'HPT Form ID',
      TestScore: 78,
      TotalScore: 54.4,
      Percentage: 59.999,
      ResultStatus: 3,
      Sections: [
        {
          Name: 'HPTSection-1',
          Order: 35,
          MaxScore: 100.09,
          TotalScore: 85.009,
          Percentage: 78.9,
          StartTime: '{{admissionDate}}T09:00:02Z',
          EndTime: '{{admissionDate}}T10:20:02Z',
          Items: [
            {
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
            },
            {
              Code: 'HPTSection-1-Item-2',
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
              Code: 'HPTSection-1-Item-3',
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
            },
          ],
        },
        {
          Name: 'HPTSection-2',
          Order: 35,
          MaxScore: 100.09,
          TotalScore: 85.009,
          Percentage: 78.9,
          StartTime: '{{admissionDate}}T09:00:02Z',
          EndTime: '{{admissionDate}}T10:20:02Z',
          Items: [
            {
              Code: 'HPTSection-2-Item-1',
              Type: SARASItemType.HAZARD_PERCEPTION,
              Version: 1.0,
              Topic: 'Road Procedure',
              Attempted: true,
              UserResponses: [
                'UserResponses1HPTTestResult{{firstName}}',
                'UserResponses2HPTTestResult{{firstName}}',
              ],
              Order: 1,
              Score: 10.01,
            },
            {
              Code: 'HPTSection-2-Item-2',
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
              Score: 11.01,
            },
          ],
        },
      ],
    },
  };
  const sectionId = '6247C2BB-9190-4EA2-AFDA-6F94B66FC5C4';

  describe('mcq sections', () => {
    test('given mcq sections items, transforms to csv rows', () => {
      const itemsMap: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const mcqSections = data.MCQTestResult?.Sections || [];
      const mcqItems = mcqSections[0].Items || [];
      transformItems(
        sectionId,
        mcqItems,
        itemsMap,
      );
      expect(itemsMap.get('2022')?.length).toBe(4);
      const allRecords = itemsMap.get('2022') || [];
      const firstRecord = allRecords[0];
      const lastRecord = allRecords[allRecords.length - 1];
      expect(firstRecord).toBe(`${mockUUID},,,,,1,False,,,,,,,,,6247C2BB-9190-4EA2-AFDA-6F94B66FC5C4,,,,,,,,,,,,,,,"MCQSection-1-Item-1",${mockUUID},59.01,,,1,"CorrectChoiceMCQTestResult{{firstName}}","Road Procedure",,,,1,,,,,,,"${mockToday}",,"UserResponses1MCQTestResult{{firstName}},UserResponses2MCQTestResult{{firstName}}",,,,,,,,,`);
      expect(lastRecord).toBe(`${mockUUID},,,,,1,True,,,,,,,,,6247C2BB-9190-4EA2-AFDA-6F94B66FC5C4,,,,,,,,,,,,,,,"MCQSection-1-Item-4",${mockUUID},15.03,,,4,"CorrectChoiceMCQTestResult{{firstName}}","Publications, Instructional Techniques",,,,1,,,,,,,"${mockToday}",,"UserResponses1MCQTestResult{{firstName}},UserResponses2MCQTestResult{{firstName}}",,,,,,,,,`);
    });
  });

  describe('hpt sections', () => {
    test('given hpt sections items, transforms to csv rows', () => {
      const itemsMap: Map<string, Array<string>> = new Map([
        ['2022', []],
      ]);
      const hptSections = data.HPTTestResult?.Sections || [];
      transformItems(
        sectionId,
        hptSections,
        itemsMap,
      );
      expect(itemsMap.get('2022')?.length).toBe(2);
    });
  });
});
