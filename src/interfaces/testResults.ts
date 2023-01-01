import {
  SARASMCQTestResult, SARASHPTTestResult, SARASTrialTest, SARASSurveyTest,
} from '@dvsa/ftts-saras-model';

export interface TestResults {
  testHistoryId: string,
  MCQTestResult?: SARASMCQTestResult,
  HPTTestResult?: SARASHPTTestResult,
  TrialTest?: SARASTrialTest,
  SurveyTest?: SARASSurveyTest
}

export enum SarasSectionType {
  MCQ_TEST_RESULT = 1,
  HPT_TEST_RESULT = 2,
  TRIAL_TEST = 3,
  SURVEY_TEST = 4,
}
