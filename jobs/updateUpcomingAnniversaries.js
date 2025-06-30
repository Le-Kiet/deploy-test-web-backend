// jobs/updateUpcomingAnniversaries.js
const Anniversary = require('../models/Anniversary');
const UpcomingAnniversary = require('../models/UpcomingAnniversary');
const { convertLunar2Solar } = require('../utils/lunarToSolar');
const dayjs = require('dayjs');
const UpdateStatus = require('../models/UpdateStatus');


async function updateUpcomingAnniversaries() {
  const today = dayjs();
  const todayYear = today.year();

  // Xoá cache cũ
  await UpcomingAnniversary.deleteMany({});

  const anniversaries = await Anniversary.find({});
  const upcomingList = [];

  for (let item of anniversaries) {
    try {
      const [day, month] = item.anni_date.split('/').map(Number);

      for (let offset = 0; offset <= 1; offset++) {
        const targetYear = todayYear + offset;
        const solarDate = convertLunar2Solar(day, month, targetYear);

        if (!solarDate) continue;

        const djs = dayjs(solarDate);
        const diff = djs.diff(today, 'day');

        if (diff >= 0 && diff <= 7) {
          upcomingList.push({
            anniversary_id: item._id,
            anni_date: item.anni_date,
            event_name: item.event_name,
            days_remaining: diff,
            display_date: djs.toDate(),
          });
        }
      }
    } catch (e) {
      console.error(`Lỗi khi xử lý ngày âm: ${item.anni_date} - ${e.message}`);
    }
  }

  if (upcomingList.length) {
    await UpcomingAnniversary.insertMany(upcomingList);
    console.log(`✅ Đã cập nhật ${upcomingList.length} ngày kỵ sắp tới`);
  } else {
    console.log(`ℹ️ Không có ngày kỵ nào trong 7 ngày tới`);
  }
  
await UpdateStatus.findOneAndUpdate(
  { task: 'upcoming_anniversaries' },
  { lastRunDate: new Date() },
  { upsert: true }
);
}

module.exports = updateUpcomingAnniversaries;
