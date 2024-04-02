export type ContributionDay = {
  date: string;
  intensity: string;
};

export type ContributionData = {
  total: number;
  range: {
    start: string;
    end: string;
  };
  contributions: {
    [year: string]: {
      [month: string]: {
        [day: string]: ContributionDay;
      };
    };
  };
};
