function generateData(param) {
  let { page = 1, limit = 10, fields = 'name' } = param || {}
  console.log(page, limit, fields);
  page = parseInt(page)
  limit = parseInt(limit)
  const filedList = fields.split(',')
  const data = new Array(limit).fill(0).map((d, ind) => {
    let item = {}
    filedList.forEach((k) => {
      let val = page + '_' + limit + '_' + (ind + 1) +  '_' + Math.random().toString(36).slice(-8)
      k = k.trim().toLowerCase()
      if (k.includes('number')) val = Math.floor(Math.random() * 99999999)
      if (k.includes('date')) val = formatDate('yyyy-MM-dd')
      if (k.includes('time')) val = formatDate('HH:mm:ss')
      if (k.includes('datetime')) val = formatDate('yyyy-MM-dd HH:mm:ss')
      if (k.includes('boolean')) val = Math.random() > 0.5
      if (k.includes('zh')) {
        val = ''
        let len = Math.round(Math.random() * 20)
        for (let i = 0; i < len + 1; i++) {
          val += getRandomChinese()
        }
      }
      item[k] = val
    })
    return item
  })
  return data
}

function formatDate(format, date) {
  if (!date) date = new Date()
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const formattedDate = format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);

  return formattedDate;
}

function getRandomChinese() {
  const start = 0x4e00; // Unicode 编码范围开始值
  // const end = 0x9fff; // Unicode 编码范围结束值
  const end = 0x4f00; // Unicode 编码范围结束值

  // 随机生成 Unicode 编码并转换为对应的字符
  const randomUnicode = Math.floor(Math.random() * (end - start + 1)) + start;
  const randomChinese = String.fromCharCode(randomUnicode);

  return randomChinese;
}


exports.handler = async function (event, context) {
  // console.log(JSON.stringify(event))
  const { httpMethod,  queryStringParameters } = event
  console.log(queryStringParameters, httpMethod)

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(generateData(queryStringParameters)),
  };
};