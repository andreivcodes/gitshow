export interface ContributionDay {
  date: string;
  level: string;
}

export interface ContributionData {
  total: number;
  range: {
    start: string;
    end: string;
  };
  contributions: ContributionDay[];
}
