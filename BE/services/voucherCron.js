const cron = require('node-cron');
const Voucher = require('../models/voucher');

/**
 * Cron job để tự động cập nhật trạng thái voucher
 * Chạy mỗi giờ để kiểm tra và cập nhật:
 * - Kích hoạt voucher đã đến thời gian
 * - Hết hạn voucher đã qua thời gian
 * - Hết hạn voucher đã hết số lượng
 */

const updateVoucherStatuses = async () => {
    try {
        console.log('Running voucher status update...');

        const now = new Date();

        // 1. Activate scheduled vouchers that have reached start date
        const activatedResult = await Voucher.updateMany(
            {
                status: 'scheduled',
                startDate: { $lte: now },
                endDate: { $gt: now },
                $expr: { $lt: ['$used', '$quantity'] }
            },
            { status: 'active' }
        );

        if (activatedResult.modifiedCount > 0) {
            console.log(`Activated ${activatedResult.modifiedCount} vouchers`);
        }

        // 2. Expire vouchers that have passed end date
        const expiredResult = await Voucher.updateMany(
            {
                status: { $in: ['active', 'scheduled'] },
                endDate: { $lt: now }
            },
            { status: 'expired' }
        );

        if (expiredResult.modifiedCount > 0) {
            console.log(`Expired ${expiredResult.modifiedCount} vouchers by date`);
        }

        // 3. Expire vouchers with no remaining quantity
        const exhaustedResult = await Voucher.updateMany(
            {
                status: 'active',
                $expr: { $gte: ['$used', '$quantity'] }
            },
            { status: 'expired' }
        );

        if (exhaustedResult.modifiedCount > 0) {
            console.log(`Expired ${exhaustedResult.modifiedCount} vouchers by quantity`);
        }

        const totalUpdated = activatedResult.modifiedCount +
            expiredResult.modifiedCount +
            exhaustedResult.modifiedCount;

        if (totalUpdated === 0) {
            console.log('No voucher status updates needed');
        } else {
            console.log(`Total voucher status updates: ${totalUpdated}`);
        }

        return {
            activated: activatedResult.modifiedCount,
            expired: expiredResult.modifiedCount + exhaustedResult.modifiedCount,
            total: totalUpdated
        };
    } catch (error) {
        console.error('Error updating voucher statuses:', error);
        throw error;
    }
};

// Setup cron job
const setupVoucherCron = () => {
    // Run every hour at minute 0
    // Format: minute hour day month weekday
    // '0 * * * *' = At minute 0 of every hour

    const job = cron.schedule('0 * * * *', async () => {
        console.log('Voucher cron job triggered at:', new Date().toISOString());
        await updateVoucherStatuses();
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });

    console.log('Voucher cron job scheduled (runs every hour)');

    // Run immediately on startup
    setTimeout(async () => {
        console.log('Running initial voucher status update...');
        await updateVoucherStatuses();
    }, 5000); // Wait 5 seconds after startup

    return job;
};

module.exports = {
    setupVoucherCron,
    updateVoucherStatuses
};