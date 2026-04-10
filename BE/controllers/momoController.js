const crypto = require('crypto');
const https = require('https');
const Order = require('../models/order');

/**
 * Controller for MoMo Payment
 */
exports.createPayment = async (req, res) => {
    try {
        const { orderId, amount, orderInfo } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ success: false, message: 'Thiếu orderId hoặc amount' });
        }

        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;
        const requestType = "captureWallet"; // payWithATM captureWallet 
        const extraData = ""; // optional
        const requestId = orderId + '-' + new Date().getTime();

        // Create raw signature string
        // format: accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        // Sign with HMAC SHA256
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        // Body of the request to MoMo
        const requestBody = JSON.stringify({
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'vi'
        });

        // Options for the HTTPS request
        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        // Send request to MoMo
        const momoReq = https.request(options, (momoRes) => {
            let data = '';

            momoRes.on('data', (chunk) => {
                data += chunk;
            });

            momoRes.on('end', () => {
                const response = JSON.parse(data);
                if (response.resultCode === 0) {
                    res.status(200).json({
                        success: true,
                        payUrl: response.payUrl
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: response.message || 'MoMo error',
                        error: response
                    });
                }
            });
        });

        momoReq.on('error', (e) => {
            console.error(`MoMo request error: ${e.message}`);
            res.status(500).json({ success: false, message: 'MoMo request failed' });
        });

        momoReq.write(requestBody);
        momoReq.end();

    } catch (error) {
        console.error('MoMo Create Payment Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Handle IPN from MoMo
 */
exports.handleIPN = async (req, res) => {
    try {
        const { orderId, resultCode, amount, partnerCode, requestId, message } = req.body;
        
        console.log('🔔 Received MoMo IPN:', req.body);

        // Verification of signature is recommended here but for dev let's process
        // MoMo resultCode 0 means success
        if (resultCode === 0) {
            const order = await Order.findById(orderId);
            if (order) {
                order.status = 'confirmed';
                order.paymentStatus = 'paid';
                await order.save();
                console.log(`✅ Order ${orderId} marked as paid via MoMo IPN`);
            }
        } else {
            console.log(`❌ MoMo payment failed for order ${orderId}: ${message}`);
        }

        // Always return 204 to MoMo to acknowledge receipt
        res.status(204).send();
    } catch (error) {
        console.error('MoMo IPN Error:', error);
        res.status(500).send();
    }
};
