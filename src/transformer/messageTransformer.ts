import { ServiceBusMessage } from '@azure/service-bus';
import { SarasSectionType, TestResults } from '../interfaces/testResults';
import { transformSections } from './transformSections';

export class MessageTransformer {
  public transformMessage(
    message: ServiceBusMessage,
    sectionsMap: Map<string, Array<string>>,
    itemsMap: Map<string, Array<string>>,
  ): void {
    const testResults = message.body as unknown as TestResults;

    if (testResults.MCQTestResult?.Sections) {
      transformSections(
        SarasSectionType.MCQ_TEST_RESULT,
        testResults.MCQTestResult?.Sections,
        testResults.testHistoryId,
        sectionsMap,
        itemsMap,
      );
    }

    if (testResults.HPTTestResult?.Sections) {
      transformSections(
        SarasSectionType.HPT_TEST_RESULT,
        testResults.HPTTestResult?.Sections,
        testResults.testHistoryId,
        sectionsMap,
        itemsMap,
      );
    }

    if (testResults.TrialTest?.Sections) {
      transformSections(
        SarasSectionType.TRIAL_TEST,
        testResults.TrialTest?.Sections,
        testResults.testHistoryId,
        sectionsMap,
        itemsMap,
      );
    }

    if (testResults.SurveyTest?.Sections) {
      transformSections(
        SarasSectionType.SURVEY_TEST,
        testResults.SurveyTest?.Sections,
        testResults.testHistoryId,
        sectionsMap,
        itemsMap,
      );
    }
  }
}

export const messageTransformer = new MessageTransformer();
