import { SARASItemResponse, SARASItemType } from '@dvsa/ftts-saras-model';

export interface Section {
  Name?: string;
  Items?: SARASItemResponse[];
  Order?: number;
  MaxScore?: number;
  TotalScore?: number;
  Percentage?: number;
  StartTime?: string;
  EndTime?: string;
}

export interface Item {
  Code?: string;
  Type?: SARASItemType;
  Version?: number;
  Topic?: string;
  Attempted?: boolean;
  Order?: number;
  Score?: number;
  CorrectChoice?: string[];
  UserResponses?: string[];
}
