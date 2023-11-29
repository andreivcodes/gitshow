export type ContributionValue = {
	date: string;
	count: number;
	color: number;
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
				[day: string]: {
					date: string;
					count: number;
					color: number;
					intensity: string;
				};
			};
		};
	};
};

export const COLOR_MAP: Record<string, number> = {
	"#196127": 4,
	"#239a3b": 3,
	"#7bc96f": 2,
	"#c6e48b": 1,
	"#ebedf0": 0,
};
