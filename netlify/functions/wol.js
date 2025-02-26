const dns = require('dns')
const axios = require('axios')
const wol = require('wake_on_lan')


function getIp(domain) {
  return new Promise((reso, rej) => {
    dns.lookup(domain, (err, address) => {
      if (err) {
        console.error(err);
        return reso('');
      }
      console.log(`The IP address for ${domain} is ${address}`);
      reso(address)
    });
  })
}

function getIpDefault() {
  return new Promise((reso, rej) => {
    axios.get('http://dhjz.github.io/ip.txt').then(res => {
      console.log('http://dhjz.github.io/ip.txt: ' + res.data);
      reso(res.data)
    }).catch(() => reso())
  })
}

function isIP(str) {
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}$/.test(str);
}

function wake(param) {
  let { ip, port, mac, count = 3 } = param
  return new Promise((reso, rej) => {
    try {
      console.log(wol)
      wol.wake(mac, { address: ip, num_packets: count, port: port}, function(error) {
        if (error) {
          console.log(`wake error, ip: ${ip}, port: ${port}, mac: ${mac}`)
          reso(false)
        } else {
          console.log(`wake success, ip: ${ip}, port: ${port}, mac: ${mac}`)
          reso(true)
        }
      })
    } catch (e) {
      console.log(e);
      console.log(`wake error, ip: ${ip}, port: ${port}, mac: ${mac}`)
      reso(false)
    }
    
  })
}

exports.handler = async function (event, context) {
  // console.log(event)
  const { httpMethod,  queryStringParameters, headers } = event
  console.log(queryStringParameters, httpMethod, headers)
  let { ip, port, mac } = queryStringParameters
  if (!ip) ip = await getIp('home.199311.xyz')
  // if (!ip) ip = await getIpDefault()
  if (!port) port = 11999 
  if (!mac) mac = '04421AA96526'

  let data = `ip: ${ip}, port: ${port}, mac: ${mac}`
  // console.log(result)
  const flag = await wake({ ip, port, mac })

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ flag, data }),
  };
};