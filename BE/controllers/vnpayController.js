const crypto = require('crypto');
const querystring = require('qs');
const Order = require('../models/order');

/**
 * Utility to format date for VNPay
 * @param {Date} date 
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Sort object keys alphabetically
 * @param {Object} obj 
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[decodeURIComponent(str[key])]).replace(/%20/g, '+');
  }
  return sorted;
}

exports.createPaymentUrl = async (req, res) => {
  try {
    const { orderId, amount, bankCode, language } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing orderId or amount' });
    }

    const ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    const date = new Date();
    const createDate = formatDate(date);

    // Multiplied by 100 as per VNPay requirement (VNPay uses integer amount)
    const vnp_Amount = amount * 100;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = language || 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang: ' + orderId;
    vnp_Params['vnp_OrderType'] = 'other'; // default
    vnp_Params['vnp_Amount'] = vnp_Amount;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.status(200).json({ success: true, paymentUrl: vnpUrl });
  } catch (error) {
    console.error('VNPay Create Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.vnpayReturn = async (req, res) => {
  let vnp_Params = req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  const secretKey = process.env.VNP_HASH_SECRET;
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];

    if (responseCode === '00') {
      // Payment successful
      try {
        await Order.findByIdAndUpdate(orderId, { 
            status: 'confirmed', 
            paymentStatus: 'paid' 
        });
        return res.status(200).json({ success: true, message: 'Payment successful' });
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    } else {
      // Payment failed
      return res.status(200).json({ success: false, message: 'Payment failed' });
    }
  } else {
    // Checksum failed
    return res.status(400).json({ success: false, message: 'Checksum failed' });
  }
};

exports.vnpayIPN = async (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
  
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
  
    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef'];
      const responseCode = vnp_Params['vnp_ResponseCode'];
  
      if (responseCode === '00') {
        // Giao dịch thành công
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
            
            // Check if order is already paid/confirmed to avoid duplicate updates
            if (['confirmed', 'shipped', 'delivered'].includes(order.status)) {
                 return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
            }

            order.status = 'confirmed';
            order.paymentStatus = 'paid';
            await order.save();

            res.status(200).json({ RspCode: '00', Message: 'Success' });
        } catch (err) {
            res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
        }
      } else {
        // Giao dịch thất bại
        res.status(200).json({ RspCode: '00', Message: 'Success' });
      }
    } else {
      res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
    }
  };
