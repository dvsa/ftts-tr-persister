import {
  SARASMCQTestResult, SARASHPTTestResult, SARASTrialTest, SARASSurveyTest,
  SARASMCQSection, SARASHPTSection, SARASTrialSection, SARASSurveySection,
} from '@dvsa/ftts-saras-model';
import { SarasSectionType } from '../../../src/interfaces/testResults';
import { MessageTransformer } from '../../../src/transformer/messageTransformer';
import { transformSections } from '../../../src/transformer/transformSections';

jest.mock('../../../src/transformer/transformSections');
const mockedTransformSections = jest.mocked(transformSections);

describe('MessageTransformer', () => {
  const testHistoryId = '5247C2BB-9190-4EA2-AFDA-6F94B66FC5C4';
  const messageTransformer: MessageTransformer = new MessageTransformer();

  const sections: Map<string, Array<string>> = new Map();
  const items: Map<string, Array<string>> = new Map();

  beforeEach(() => {
    sections.clear();
    items.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('mcq sestions', () => {
    test('when message has mcq sections then transformMessage with correct arguments is called', () => {
      const message = {
        body: {
          testHistoryId,
          MCQTestResult: mcqTestResultWithSections,
        },
      };

      messageTransformer.transformMessage(message, sections, items);

      expect(mockedTransformSections).toHaveBeenCalledTimes(1);
      expect(mockedTransformSections).toHaveBeenCalledWith(SarasSectionType.MCQ_TEST_RESULT, [mcqSection], testHistoryId, sections, items);
    });

    test('when message do not have mcq sections then transformMessage is not called', () => {
      const message = {
        body: {
          testHistoryId,
          MCQTestResult: mcqTestResultWithoutSections,
        },
      };

      messageTransformer.transformMessage(message, sections, items);

      expect(mockedTransformSections).not.toHaveBeenCalled();
    });
  });

  describe('hpt sestions', () => {
    test('when message has hpt sections then transformMessage with correct arguments is called', () => {
      const message = {
        body: {
          testHistoryId,
          HPTTestResult: hptTestResultWithSections,
        },
      };

      messageTransformer.transformMessage(message, sections, items);

      expect(mockedTransformSections).toHaveBeenCalledTimes(1);
      expect(mockedTransformSections).toHaveBeenCalledWith(SarasSectionType.HPT_TEST_RESULT, [hptSection], testHistoryId, sections, items);
    });

    test('when message do not have hpt sections then transformMessage is not called', () => {
      const message = {
        body: {
          testHistoryId,
          HPTTestResult: hptTestResultWithoutSections,
        },
      };

      messageTransformer.transformMessage(message, sections, items);

      expect(mockedTransformSections).not.toHaveBeenCalled();
    });
  });

  describe('trial sestions', () => {
    test('when message has trial sections then transformMessage with correct arguments is called', () => {
      const message = {
        body: {
          testHistoryId,
          TrialTest: trialTestResultWithSections,
        },
      };

      messageTransformer.transformMessage(message, sections, items);

      expect(mockedTransformSections).toHaveBeenCalledTimes(1);
      expect(mockedTransformSections).toHaveBeenCalledWith(SarasSectionType.TRIAL_TEST, [trialSection], testHistoryId, sections, items);
    });

    test('when message do not have trial sections then transformMessage is not called', () => {
      const message = {
        body: {
          testHistoryId,
          TrialTest: trialTestResultWithoutSections,
        },
      };

      messageTransformer.transformMessage(message, sections, items);

      expect(mockedTransformSections).not.toHaveBeenCalled();
    });
  });

  describe('survey sestions', () => {
    test('when message has survey sections then transformMessage with correct arguments is called', () => {
      const message = {
        body: {
          testHistoryId,
          SurveyTest: surveyTestResultWithSections,
        },
      };

      messageTransformer.transformMessage(message, sections, items);

      expect(mockedTransformSections).toHaveBeenCalledTimes(1);
      expect(mockedTransformSections).toHaveBeenCalledWith(SarasSectionType.SURVEY_TEST, [surveySection], testHistoryId, sections, items);
    });

    test('when message do not have survey sections then transformMessage is not called', () => {
      const message = {
        body: {
          testHistoryId,
          SurveyTest: surveyTestResultWithoutSections,
        },
      };

      messageTransformer.transformMessage(message, sections, items);

      expect(mockedTransformSections).not.toHaveBeenCalled();
    });
  });
});

const mcqSection = {} as unknown as SARASMCQSection;
const mcqTestResultWithSections: SARASMCQTestResult = {
  Sections: [mcqSection],
};
const mcqTestResultWithoutSections: SARASMCQTestResult = { };

const hptSection = {} as unknown as SARASHPTSection;
const hptTestResultWithSections: SARASHPTTestResult = {
  Sections: [hptSection],
};
const hptTestResultWithoutSections: SARASHPTTestResult = { };

const trialSection = {} as unknown as SARASTrialSection;
const trialTestResultWithSections: SARASTrialTest = {
  Sections: [trialSection],
};
const trialTestResultWithoutSections: SARASTrialTest = { };

const surveySection = {} as unknown as SARASSurveySection;
const surveyTestResultWithSections: SARASSurveyTest = {
  Sections: [surveySection],
};
const surveyTestResultWithoutSections: SARASSurveyTest = { };
