const NUM_REFERRALS = 100000;

const referrals = Array.from({ length: NUM_REFERRALS }, () => ({
    activation_status: true,
    activation_date: new Date(2023, 5, Math.floor(Math.random() * 30) + 1).toISOString(),
    registration_date: new Date(2023, 4, Math.floor(Math.random() * 30) + 1).toISOString()
}));

const year = 2023;
const month = 6;

// Old approach
const start1 = performance.now();
const startDate = new Date(year, month - 1, 1);
const endDate = new Date(year, month, 0, 23, 59, 59);

let qualifyingCount1 = 0;
for (const ref of referrals) {
    if (ref.activation_status && ref.activation_date) {
        const actDate = new Date(ref.activation_date);
        const regDate = new Date(ref.registration_date);

        if (actDate >= startDate && actDate <= endDate) {
            const diffDays = (actDate.getTime() - regDate.getTime()) / (1000 * 3600 * 24);
            if (diffDays <= 30) {
                qualifyingCount1++;
            }
        }
    }
}
const end1 = performance.now();

// New approach
const start2 = performance.now();
const startTimestamp = new Date(year, month - 1, 1).getTime();
const endTimestamp = new Date(year, month, 0, 23, 59, 59).getTime();

let qualifyingCount2 = 0;
for (const ref of referrals) {
    if (ref.activation_status && ref.activation_date) {
        const actTime = Date.parse(ref.activation_date);

        if (actTime >= startTimestamp && actTime <= endTimestamp) {
            const regTime = Date.parse(ref.registration_date);
            const diffDays = (actTime - regTime) / (1000 * 3600 * 24);
            if (diffDays <= 30) {
                qualifyingCount2++;
            }
        }
    }
}
const end2 = performance.now();

console.log(`Old approach took: ${(end1 - start1).toFixed(2)}ms, result: ${qualifyingCount1}`);
console.log(`New approach took: ${(end2 - start2).toFixed(2)}ms, result: ${qualifyingCount2}`);
