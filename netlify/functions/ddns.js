const http = require('http');
const axios = require('axios');
const tencentcloud = require("tencentcloud-sdk-nodejs");

function getIPAddr() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://ip.3322.net', (res) => {
      let ip = '';

      res.on('data', (chunk) => {
        ip += chunk;
      });

      res.on('end', () => {
        resolve(ip.trim());
      });
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

exports.handler = async function (event, context) {
  // console.log(event)
  const { httpMethod,  queryStringParameters, headers } = event
  console.log(queryStringParameters, httpMethod, headers)
  let result = ''

  const DnspodClient = tencentcloud.dnspod.v20210323.Client;

  let { ip, key } = queryStringParameters

  if (!key) return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: 'please set correct param `key` :' + ip,
  }

  if (!ip) ip = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for']

  if (ip.includes('::1') || !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: 'please set correct param `ip` :' + ip,
  }

  // 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
  // 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
  // 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
  const clientConfig = {
    credential: {
      secretId: "AKID52nPm0MLPMAqNNE3lKhv28FArSxMep8K",
      secretKey: "NemslU8b4kYF2ulgT2Gc8mQ9X7aqwvnW9g6QkzM".replace(key, ''),
    },
    region: "",
    profile: {
      httpProfile: {
        endpoint: "dnspod.tencentcloudapi.com",
      },
    },
  };

  // 实例化要请求产品的client对象,clientProfile是可选的
  const client = new DnspodClient(clientConfig);

  try {
    // const ipAddr = await getIPAddr();
    const ipAddr = ip
    const params = {
      Domain: 'dhjz.fun',
      SubDomain: 'home',
      RecordType: 'A',
      RecordLine: '默认',
      Value: ipAddr,
      RecordId: 1602352775,
    };
    await client.ModifyRecord(params).then(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.error("error", err);
      }
    );
    console.log('更新ip到ddns成功: ' + ipAddr);

    result = 'ip -->> ddns success: ' + ipAddr
  } catch (error) {
    console.error('获取ip错误：', error);
    result = 'ip -->> ddns error: ' + ipAddr + '--------' + error 
  }

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: result,
  };
};